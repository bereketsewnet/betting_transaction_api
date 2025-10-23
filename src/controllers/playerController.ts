import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PlayerProfile, Language, Template, User, Transaction, TransactionStatus, DepositBank, WithdrawalBank } from '../models';
import { validate, schemas } from '../middlewares/validation';
import { telegramService } from '../services/telegramService';
import Joi from 'joi';

export class PlayerController {
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
export const updatePlayerValidation = validate(
  Joi.object({
    telegramId: Joi.string().optional(),
    telegramUsername: Joi.string().optional(),
    languageCode: Joi.string().length(2).optional(),
  })
);
