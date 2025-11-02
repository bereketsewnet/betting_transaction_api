import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PlayerProfile, Language, Template, User, Transaction, TransactionStatus, DepositBank, WithdrawalBank, Role } from '../models';
import { validate, schemas } from '../middlewares/validation';
import { telegramService } from '../services/telegramService';
import Joi from 'joi';

export class PlayerController {
  /**
   * Extended player registration with full account details
   */
  static async registerPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { 
        telegramId, 
        telegramUsername, 
        languageCode,
        username,
        email,
        phone,
        password,
        displayName
      } = req.body;

      // If full registration details provided, create user account first
      let userAccount = null;
      if (username && email && password) {
        const bcrypt = require('bcrypt');
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Get player role ID by querying the database
        const playerRole = await Role.findOne({
          where: { name: 'player' },
        });

        if (!playerRole) {
          res.status(500).json({ 
            error: 'Player role not found',
            message: 'Unable to find player role in database. Please ensure roles are properly seeded.'
          });
          return;
        }
        
        // Create user account first
        userAccount = await User.create({
          username,
          email,
          passwordHash,
          roleId: playerRole.id,
          displayName: displayName || username,
          phone: phone || null,
          isActive: true,
        });
      }

      // Generate unique player UUID
      const playerUuid = uuidv4();

      // Create player profile with user ID if available
      const playerProfile = await PlayerProfile.create({
        telegramId: telegramId || `temp_${Date.now()}`,
        telegramUsername: telegramUsername || `temp_player_${Math.random().toString(36).substr(2, 9)}`,
        playerUuid,
        languageCode: languageCode || 'en',
        lastActive: new Date(),
        userId: userAccount ? userAccount.id : undefined, // Link to user account if created
      });

      // Send welcome message via Telegram if configured
      if (telegramId && telegramService.isConfigured()) {
        await telegramService.sendWelcomeMessage(telegramId, languageCode);
      }

      res.status(201).json({
        message: 'Player registered successfully',
        player: {
          id: playerProfile.id,
          playerUuid: playerProfile.playerUuid,
          telegramId: playerProfile.telegramId,
          telegramUsername: playerProfile.telegramUsername,
          languageCode: playerProfile.languageCode,
          isTemporary: playerProfile.telegramId?.startsWith('temp_') || false,
          hasUserAccount: !!userAccount,
          userAccount: userAccount ? {
            id: userAccount.id,
            username: userAccount.username,
            email: userAccount.email,
            displayName: userAccount.displayName,
            phone: userAccount.phone,
          } : null,
          createdAt: playerProfile.createdAt,
        },
      });
    } catch (error) {
      console.error('Register player error:', error);
      res.status(500).json({ 
        error: 'Failed to register player',
        message: 'Internal server error while registering player',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Create a new player profile
   */
  static async createPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { telegramId, telegramUsername, languageCode } = req.body;

      // Generate unique player UUID
      const playerUuid = uuidv4();

      const playerProfile = await PlayerProfile.create({
        telegramId,
        telegramUsername,
        playerUuid,
        languageCode: languageCode || 'en',
        lastActive: new Date(),
      });

      // Send welcome message via Telegram if configured
      if (telegramId && telegramService.isConfigured()) {
        await telegramService.sendWelcomeMessage(telegramId, languageCode);
      }

      res.status(201).json({
        message: 'Player profile created successfully',
        player: {
          id: playerProfile.id,
          playerUuid: playerProfile.playerUuid,
          telegramId: playerProfile.telegramId,
          telegramUsername: playerProfile.telegramUsername,
          languageCode: playerProfile.languageCode,
          lastActive: playerProfile.lastActive,
        },
      });
    } catch (error) {
      console.error('Create player error:', error);
      res.status(500).json({ error: 'Failed to create player profile' });
    }
  }

  /**
   * Get player profile by UUID
   */
  static async getPlayerByUuid(req: Request, res: Response): Promise<void> {
    try {
      const { playerUuid } = req.params;

      const playerProfile = await PlayerProfile.findOne({
        where: { playerUuid },
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['passwordHash'] },
        }],
      });

      if (!playerProfile) {
        res.status(404).json({ error: 'Player profile not found' });
        return;
      }

      res.json({
        player: {
          id: playerProfile.id,
          playerUuid: playerProfile.playerUuid,
          telegramId: playerProfile.telegramId,
          telegramUsername: playerProfile.telegramUsername,
          languageCode: playerProfile.languageCode,
          lastActive: playerProfile.lastActive,
          user: playerProfile.user,
        },
      });
    } catch (error) {
      console.error('Get player error:', error);
      res.status(500).json({ error: 'Failed to get player profile' });
    }
  }

  /**
   * Get player profile by user ID
   */
  static async getPlayerByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const playerProfile = await PlayerProfile.findOne({
        where: { userId },
        include: [{
          model: User,
          as: 'user',
          attributes: { exclude: ['passwordHash'] },
        }],
      });

      if (!playerProfile) {
        res.status(404).json({ error: 'Player profile not found for this user' });
        return;
      }

      res.json({
        player: {
          id: playerProfile.id,
          playerUuid: playerProfile.playerUuid,
          userId: playerProfile.userId,
          telegramId: playerProfile.telegramId,
          telegramUsername: playerProfile.telegramUsername,
          languageCode: playerProfile.languageCode,
          lastActive: playerProfile.lastActive,
          user: playerProfile.user,
        },
      });
    } catch (error) {
      console.error('Get player by user ID error:', error);
      res.status(500).json({ error: 'Failed to get player profile' });
    }
  }

  /**
   * Update player profile
   */
  static async updatePlayer(req: Request, res: Response): Promise<void> {
    try {
      const { playerUuid } = req.params;
      const { telegramId, telegramUsername, languageCode } = req.body;

      const playerProfile = await PlayerProfile.findOne({
        where: { playerUuid },
      });

      if (!playerProfile) {
        res.status(404).json({ error: 'Player profile not found' });
        return;
      }

      await playerProfile.update({
        telegramId,
        telegramUsername,
        languageCode,
        lastActive: new Date(),
      });

      res.json({
        message: 'Player profile updated successfully',
        player: {
          id: playerProfile.id,
          playerUuid: playerProfile.playerUuid,
          telegramId: playerProfile.telegramId,
          telegramUsername: playerProfile.telegramUsername,
          languageCode: playerProfile.languageCode,
          lastActive: playerProfile.lastActive,
        },
      });
    } catch (error) {
      console.error('Update player error:', error);
      res.status(500).json({ error: 'Failed to update player profile' });
    }
  }

  /**
   * Get player transactions
   */
  static async getPlayerTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { playerUuid } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const playerProfile = await PlayerProfile.findOne({
        where: { playerUuid },
      });

      if (!playerProfile) {
        res.status(404).json({ error: 'Player profile not found' });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: { playerProfileId: playerProfile.id },
        include: [
          {
            model: TransactionStatus,
            as: 'status',
          },
          {
            model: DepositBank,
            as: 'depositBank',
            required: false,
          },
          {
            model: WithdrawalBank,
            as: 'withdrawalBank',
            required: false,
          },
          {
            model: User,
            as: 'assignedAgent',
            required: false,
            attributes: ['id', 'username', 'displayName'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
      });

      res.json({
        transactions: transactions.map(transaction => ({
          id: transaction.id,
          transactionUuid: transaction.transactionUuid,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status?.label,
          depositBank: transaction.depositBank,
          withdrawalBank: transaction.withdrawalBank,
          withdrawalAddress: transaction.withdrawalAddress,
          screenshotUrl: transaction.screenshotUrl,
          requestedAt: transaction.requestedAt,
          assignedAgent: transaction.assignedAgent,
          adminNotes: transaction.adminNotes,
          agentNotes: transaction.agentNotes,
          rating: transaction.rating,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })),
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Get player transactions error:', error);
      res.status(500).json({ error: 'Failed to get player transactions' });
    }
  }
}

// Export validation middleware for routes
export const createPlayerValidation = validate(schemas.createPlayer);
export const registerPlayerValidation = validate(schemas.registerPlayer);
export const updatePlayerValidation = validate(
  Joi.object({
    telegramId: Joi.string().optional(),
    telegramUsername: Joi.string().optional(),
    languageCode: Joi.string().length(2).optional(),
  })
);
