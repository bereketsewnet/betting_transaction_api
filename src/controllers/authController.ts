import { Request, Response } from 'express';
import { AuthService } from '../utils/auth';
import { User, RefreshToken, PlayerProfile, Role } from '../models';
import { validate, schemas } from '../middlewares/validation';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  /**
   * Login or Register via Telegram Contact
   */
  static async telegramLogin(req: Request, res: Response): Promise<void> {
    try {
      const { phone, telegramId, firstName, lastName, username: telegramUsername } = req.body;
      
      // 1. Try to find user by phone
      let user = await User.findOne({ 
        where: { phone },
        include: [{ model: Role, as: 'role' }]
      });

      // 2. Try to find player profile by telegramId
      let playerProfile = await PlayerProfile.findOne({
        where: { telegramId: telegramId.toString() }
      });

      // Scenario: User exists by phone
      if (user) {
        // Ensure player profile exists and is linked
        if (!playerProfile) {
           // Create player profile
           playerProfile = await PlayerProfile.create({
             userId: user.id,
             telegramId: telegramId.toString(),
             telegramUsername,
             playerUuid: uuidv4(),
             languageCode: 'en'
           });
        } else if (!playerProfile.userId) {
           // Link existing profile to user
           await playerProfile.update({ userId: user.id, telegramUsername });
        } else if (playerProfile.userId !== user.id) {
           // Update link to current user
           await playerProfile.update({ userId: user.id, telegramUsername });
        }
      } else {
        // User not found by phone
        
        // Check if player profile exists and has a user (maybe user changed phone on telegram?)
        // If we trust telegram ID more than phone... but user asked to login by contact share.
        // If contact share phone is different from DB phone, we should probably find user by telegram ID first?
        // But the requirement is "backend user as email or registrion also so fix also that use phone and email".
        // Let's stick to Phone as primary identifier for this flow.
        
        if (playerProfile && playerProfile.userId) {
            const existingUser = await User.findByPk(playerProfile.userId, {
                include: [{ model: Role, as: 'role' }]
            });
            
            if (existingUser) {
                // User found by Telegram ID connection
                user = existingUser;
                // Update phone if it was empty or different?
                // If it was different, updating it might conflict if another user has that phone.
                // But we already checked phone uniqueness (User.findOne by phone returned null).
                if (user.phone !== phone) {
                    await user.update({ phone });
                }
            }
        }
        
        if (!user) {
            // Create new user
            const password = uuidv4();
            const passwordHash = await AuthService.hashPassword(password);
            
            // Generate unique username/email
            // Clean phone for username
            const cleanPhone = phone.replace(/[^\d]/g, '');
            const baseUsername = telegramUsername || `user${cleanPhone}`;
            let newUsername = baseUsername;
            let counter = 1;
            
            // Check username uniqueness
            while (await User.findOne({ where: { username: newUsername } })) {
                newUsername = `${baseUsername}${counter++}`;
            }
            
            // Check email uniqueness just in case
            const baseEmail = `${newUsername}@telegram.bot`;
            let email = baseEmail;
            counter = 1;
            while (await User.findOne({ where: { email } })) {
                email = `${newUsername}${counter++}@telegram.bot`;
            }
            
            // Get Player role
            const playerRole = await Role.findOne({ where: { name: 'player' } });
            
            user = await User.create({
                username: newUsername,
                email,
                passwordHash,
                roleId: playerRole ? playerRole.id : 1, // Fallback to 1
                displayName: `${firstName || ''} ${lastName || ''}`.trim() || newUsername,
                phone,
                isActive: true
            });
            
            // Re-fetch with role for token generation
            user = await User.findByPk(user.id, {
                include: [{ model: Role, as: 'role' }]
            }) as User;
        }
        
        // Link profile
        if (!playerProfile) {
             playerProfile = await PlayerProfile.create({
                 userId: user.id,
                 telegramId: telegramId.toString(),
                 telegramUsername,
                 playerUuid: uuidv4(),
                 languageCode: 'en'
             });
        } else if (!playerProfile.userId) {
             await playerProfile.update({ userId: user.id, telegramUsername });
        }
      }

      if (!user) {
          throw new Error('Failed to identify or create user');
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
          phone: user.phone
        },
        ...tokens,
      });

    } catch (error) {
      console.error('Telegram login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

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

export const telegramLoginValidation = validate(
  require('joi').object({
    phone: require('joi').string().required(),
    telegramId: require('joi').alternatives().try(
      require('joi').string(),
      require('joi').number()
    ).required(),
    firstName: require('joi').string().allow('', null).optional(),
    lastName: require('joi').string().allow('', null).optional(),
    username: require('joi').string().allow('', null).optional(),
  })
);
