import { Request, Response } from 'express';
import { AuthService } from '../utils/auth';
import { User, RefreshToken } from '../models';
import { validate, schemas } from '../middlewares/validation';

export class AuthController {
  /**
   * Login user with username/email and password
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const user = await AuthService.authenticateUser(username, password);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const tokens = await AuthService.generateTokens(user);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role?.name,
        },
        ...tokens,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const user = await AuthService.verifyRefreshToken(refreshToken);
      if (!user) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
      }

      const tokens = await AuthService.generateTokens(user);

      res.json({
        message: 'Token refreshed successfully',
        ...tokens,
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ error: 'Token refresh failed' });
    }
  }

  /**
   * Logout user by revoking refresh token
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.revokeRefreshToken(refreshToken);
      }

      res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * Get current user profile
   */
  static async profile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const user = await User.findByPk(req.user.userId, {
        include: [{
          model: require('../models').Role,
          as: 'role',
        }],
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          phone: user.phone,
          role: user.role?.name,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findByPk(req.user.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isValidPassword = await AuthService.comparePassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
      }

      const newPasswordHash = await AuthService.hashPassword(newPassword);
      await user.update({ passwordHash: newPasswordHash });

      // Revoke all refresh tokens for security
      await AuthService.revokeAllUserTokens(user.id);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
}

// Export validation middleware for routes
export const loginValidation = validate(schemas.login);
export const refreshTokenValidation = validate(schemas.refreshToken);
export const logoutValidation = validate(schemas.logout);
export const changePasswordValidation = validate(
  require('joi').object({
    currentPassword: require('joi').string().required(),
    newPassword: require('joi').string().min(6).required(),
  })
);
