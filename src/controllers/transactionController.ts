import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionStatus, PlayerProfile, DepositBank, WithdrawalBank, AuditLog, User, TransactionEvidence, TransactionComment } from '../models';
import { validate, schemas, validateQuery } from '../middlewares/validation';
import { fileUploadService } from '../services/fileUpload';
import { socketService } from '../services/socketService';
import { telegramService } from '../services/telegramService';

export class TransactionController {
  /**
   * Create a new transaction (public endpoint)
   */
  static async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { playerUuid, type, amount, currency, depositBankId, withdrawalBankId, withdrawalAddress } = req.body;

      // Find player profile
      const playerProfile = await PlayerProfile.findOne({
        where: { playerUuid },
      });

      if (!playerProfile) {
        res.status(404).json({ error: 'Player profile not found' });
        return;
      }

      // Get PENDING status
      const pendingStatus = await TransactionStatus.findOne({
        where: { code: 'PENDING' },
      });

      if (!pendingStatus) {
        res.status(500).json({ error: 'Transaction status not found' });
        return;
      }

      // Handle file upload if present
      let screenshotUrl = '';
      if (req.file) {
        const uploadResult = await fileUploadService.uploadFile(req.file);
        screenshotUrl = uploadResult.url;
      }

      // Create transaction
      const transaction = await Transaction.create({
        transactionUuid: uuidv4(),
        playerProfileId: playerProfile.id,
        userId: req.user?.userId, // Optional user association
        type,
        amount: parseFloat(amount),
        currency: currency || 'USD',
        depositBankId: type === 'DEPOSIT' ? depositBankId : null,
        withdrawalBankId: type === 'WITHDRAW' ? withdrawalBankId : null,
        withdrawalAddress: type === 'WITHDRAW' ? withdrawalAddress : null,
        screenshotUrl,
        requestedAt: new Date(),
        statusId: pendingStatus.id,
      });

      // Load transaction with relations for notification
      const transactionWithRelations = await Transaction.findByPk(transaction.id, {
        include: [
          {
            model: PlayerProfile,
            as: 'playerProfile',
          },
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
        ],
      });

      // Notify admins via Socket.IO
      if (socketService) {
        socketService.notifyAdmins({
          type: 'transaction_created',
          transactionId: transaction.id,
          transactionUuid: transaction.transactionUuid,
          message: `New ${type.toLowerCase()} transaction created`,
          data: {
            amount: transaction.amount,
            currency: transaction.currency,
            playerUuid: playerProfile.playerUuid,
          },
        });
      }

      // Send Telegram notification to player
      if (playerProfile.telegramId && telegramService.isConfigured()) {
        await telegramService.sendTransactionNotification(
          playerProfile.telegramId,
          transaction.transactionUuid,
          'created',
          {
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            status: transactionWithRelations?.status?.label,
          }
        );
      }

      res.status(201).json({
        message: 'Transaction created successfully',
        transaction: {
          id: transaction.id,
          transactionUuid: transaction.transactionUuid,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transactionWithRelations?.status?.label,
          screenshotUrl: transaction.screenshotUrl,
          requestedAt: transaction.requestedAt,
          createdAt: transaction.createdAt,
        },
      });
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }

  /**
   * Get transaction by ID (authorized access)
   */
  static async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findByPk(id, {
        include: [
          {
            model: PlayerProfile,
            as: 'playerProfile',
          },
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
          {
            model: TransactionEvidence,
            as: 'evidence',
            required: false,
          },
          {
            model: TransactionComment,
            as: 'comments',
            required: false,
            include: [{
              model: User,
              as: 'commenter',
              attributes: ['id', 'username', 'displayName'],
            }],
          },
        ],
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      // Check access permissions
      const userRole = req.user?.role;
      const isOwner = transaction.playerProfile?.playerUuid === req.query.player_uuid;
      const isAssignedAgent = transaction.assignedAgentId === req.user?.userId;
      const isAdminOrAgent = ['admin', 'agent'].includes(userRole || '');

      if (!isOwner && !isAdminOrAgent && !isAssignedAgent) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json({
        transaction: {
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
          evidence: transaction.evidence,
          comments: transaction.comments,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        },
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ error: 'Failed to get transaction' });
    }
  }

  /**
   * Get transactions by player UUID (public access)
   */
  static async getTransactionsByPlayer(req: Request, res: Response): Promise<void> {
    try {
      const { playerUuid } = req.query;
      const { page = 1, limit = 20 } = req.query;

      if (!playerUuid) {
        res.status(400).json({ error: 'Player UUID is required' });
        return;
      }

      const playerProfile = await PlayerProfile.findOne({
        where: { playerUuid: playerUuid as string },
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
      console.error('Get transactions by player error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }
}

// Export validation middleware for routes
export const createTransactionValidation = validate(schemas.createTransaction);
export const getTransactionsByPlayerValidation = validateQuery(schemas.transactionFilters);
