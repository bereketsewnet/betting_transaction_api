import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken, User } from '../models';


export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a password with its hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.JWT_SECRET, { 
      expiresIn: this.JWT_EXPIRES_IN 
    } as jwt.SignOptions);
  }
  

  /**
   * Generate refresh token and store in database
   */
  static async generateRefreshToken(userId: number): Promise<string> {
    const token = uuidv4();
    const tokenHash = await this.hashPassword(token);
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await RefreshToken.create({
      userId,
      tokenHash,
      expiresAt,
      revoked: false,
    });

    return token;
  }

  /**
   * Verify JWT access token
   */
  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token and return user
   */
  static async verifyRefreshToken(token: string): Promise<User | null> {
    try {
      const tokenHash = await this.hashPassword(token);
      
      const refreshToken = await RefreshToken.findOne({
        where: {
          tokenHash,
          revoked: false,
          expiresAt: {
            [require('sequelize').Op.gt]: new Date(),
          },
        },
        include: [{
          model: User,
          as: 'user',
          include: [{
            model: require('../models').Role,
            as: 'role',
          }],
        }],
      });

      return refreshToken?.user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      const tokenHash = await this.hashPassword(token);
      
      const [affectedRows] = await RefreshToken.update(
        { revoked: true },
        {
          where: {
            tokenHash,
            revoked: false,
          },
        }
      );

      return affectedRows > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(userId: number): Promise<void> {
    await RefreshToken.update(
      { revoked: true },
      {
        where: {
          userId,
          revoked: false,
        },
      }
    );
  }

  /**
   * Authenticate user with username/email and password
   */
  static async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const user = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { username },
            { email: username },
            { phone: username },
          ],
          isActive: true,
        },
        include: [{
          model: require('../models').Role,
          as: 'role',
        }],
      });

      if (!user) {
        return null;
      }

      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static async generateTokens(user: User): Promise<AuthTokens> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      username: user.username,
      role: user.role?.name || 'player',
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    // Calculate expiration time in seconds
    const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }
}
