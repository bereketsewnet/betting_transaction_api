import { createServer } from 'http';
import dotenv from 'dotenv';
import { app, initializeDatabase } from './app';
import { initializeSocketService } from './services/socketService';
import { telegramService } from './services/telegramService';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocketService(server);

// Initialize database and start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`💬 Socket.IO enabled`);
      
      // Check Telegram bot configuration
      if (telegramService.isConfigured()) {
        console.log(`🤖 Telegram bot configured`);
      } else {
        console.log(`⚠️  Telegram bot not configured (set TELEGRAM_BOT_TOKEN)`);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
