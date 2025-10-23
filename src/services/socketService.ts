import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { AuthService } from '../utils/auth';
import { User } from '../models';

export interface AuthenticatedSocket extends Socket {
  user?: User;
}

export interface NotificationData {
  type: 'transaction_created' | 'transaction_assigned' | 'transaction_processed' | 'transaction_updated';
  transactionId: number;
  transactionUuid: string;
  message: string;
  data?: any;
}

class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<number, string> = new Map(); // userId -> socketId
  private connectedAdmins: Set<string> = new Set(); // socketIds of admins
  private connectedAgents: Set<string> = new Set(); // socketIds of agents

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const payload = AuthService.verifyAccessToken(token);
        if (!payload) {
          return next(new Error('Authentication error: Invalid token'));
        }

        // Get user with role information
        const user = await User.findByPk(payload.userId, {
          include: [{
            model: require('../models').Role,
            as: 'role',
          }],
        });

        if (!user || !user.isActive) {
          return next(new Error('Authentication error: User not found or inactive'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error: Token verification failed'));
      }
    });
  }

  /**
   * Setup socket event handlers
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.user?.username} connected with socket ${socket.id}`);

      // Track connected users
      if (socket.user) {
        this.connectedUsers.set(socket.user.id, socket.id);
        
        // Track by role
        const role = socket.user.role?.name;
        if (role === 'admin') {
          this.connectedAdmins.add(socket.id);
        } else if (role === 'agent') {
          this.connectedAgents.add(socket.id);
        }
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user?.username} disconnected`);
        
        if (socket.user) {
          this.connectedUsers.delete(socket.user.id);
          
          const role = socket.user.role?.name;
          if (role === 'admin') {
            this.connectedAdmins.delete(socket.id);
          } else if (role === 'agent') {
            this.connectedAgents.delete(socket.id);
          }
        }
      });

      // Handle joining specific rooms
      socket.on('join_room', (room: string) => {
        socket.join(room);
        console.log(`User ${socket.user?.username} joined room: ${room}`);
      });

      socket.on('leave_room', (room: string) => {
        socket.leave(room);
        console.log(`User ${socket.user?.username} left room: ${room}`);
      });
    });
  }

  /**
   * Notify all connected admins
   */
  notifyAdmins(notification: NotificationData): void {
    this.connectedAdmins.forEach(socketId => {
      this.io.to(socketId).emit('admin_notification', notification);
    });
  }

  /**
   * Notify specific agent
   */
  notifyAgent(agentId: number, notification: NotificationData): void {
    const socketId = this.connectedUsers.get(agentId);
    if (socketId) {
      this.io.to(socketId).emit('agent_notification', notification);
    }
  }

  /**
   * Notify specific user
   */
  notifyUser(userId: number, notification: NotificationData): void {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('user_notification', notification);
    }
  }

  /**
   * Notify all users in a room
   */
  notifyRoom(room: string, notification: NotificationData): void {
    this.io.to(room).emit('room_notification', notification);
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(notification: NotificationData): void {
    this.io.emit('broadcast', notification);
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get connected admins count
   */
  getConnectedAdminsCount(): number {
    return this.connectedAdmins.size;
  }

  /**
   * Get connected agents count
   */
  getConnectedAgentsCount(): number {
    return this.connectedAgents.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get socket instance for external use
   */
  getIO(): SocketIOServer {
    return this.io;
  }
}

export let socketService: SocketService;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  socketService = new SocketService(server);
  return socketService;
};
