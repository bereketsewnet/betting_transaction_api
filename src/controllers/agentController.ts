import { Request, Response } from 'express';
import { Transaction, TransactionStatus, TransactionEvidence, AuditLog, PlayerProfile, DepositBank, WithdrawalBank } from '../models';
import { validate, schemas, validateQuery } from '../middlewares/validation';
import { fileUploadService } from '../services/fileUpload';
import { socketService } from '../services/socketService';
import { telegramService } from '../services/telegramService';
import { Op } from 'sequelize';
import Joi from 'joi';

export class AgentController {
  /**
   * Get assigned tasks for agent
   */
  static async getTasks(req: Request, res: Response): Promise<void> {
    try {
      const { status, dateRange, page = 1, limit = 20 } = req.query;
      const agentId = (req as any).user?.userId;

      if (!agentId) {
        res.status(401).json({ error: 'Agent ID not found' });
        return;
      }

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = { assignedAgentId: agentId };

      if (status) {
        const statusRecord = await TransactionStatus.findOne({ where: { code: status as string } });
        if (statusRecord) {
          whereClause.statusId = statusRecord.id;
        }
      }

      if (dateRange) {
        const [startDate, endDate] = (dateRange as string).split(',');
        whereClause.createdAt = {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        };
      }

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
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
            model: TransactionEvidence,
            as: 'evidence',
            required: false,
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
      });

      res.json({
        tasks: transactions.map(transaction => ({
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
          bettingSiteId: transaction.bettingSiteId,
          playerSiteId: transaction.playerSiteId,
          requestedAt: transaction.requestedAt,
          adminNotes: transaction.adminNotes,
          agentNotes: transaction.agentNotes,
          rating: transaction.rating,
          playerProfile: {
            id: transaction.playerProfile?.id,
            playerUuid: transaction.playerProfile?.playerUuid,
            telegramUsername: transaction.playerProfile?.telegramUsername,
          },
          evidence: transaction.evidence,
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
      console.error('Get tasks error:', error);
      res.status(500).json({ 
        error: 'Failed to get tasks',
        message: 'Internal server error while fetching agent tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Process transaction (agent action)
   */
  static async processTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, agentNotes, evidenceUrl } = req.body;
      const agentId = (req as any).user?.userId;

      if (!agentId) {
        res.status(401).json({ error: 'Agent ID not found' });
        return;
      }

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
        ],
      });

      if (!transaction) {
        res.status(404).json({ 
          error: 'Transaction not found',
          message: 'The requested transaction does not exist'
        });
        return;
      }

      // Check if agent is assigned to this transaction
      if (transaction.assignedAgentId !== agentId) {
        res.status(403).json({ 
          error: 'Access denied. This transaction is not assigned to you.',
          message: 'You can only process transactions assigned to you'
        });
        return;
      }

      const statusRecord = await TransactionStatus.findOne({ where: { code: status } });
      if (!statusRecord) {
        res.status(400).json({ 
          error: 'Invalid status',
          message: 'The provided status is not valid',
          validStatuses: ['PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'CANCELLED']
        });
        return;
      }

      const oldStatusId = transaction.statusId;
      await transaction.update({
        statusId: statusRecord.id,
        agentNotes,
      });

      // Add evidence if provided
      if (evidenceUrl) {
        await TransactionEvidence.create({
          transactionId: transaction.id,
          uploadedByUserId: agentId,
          fileUrl: evidenceUrl,
          fileType: 'image',
        });
      }

      // Create audit log
      if (agentId) {
        await AuditLog.create({
          actorUserId: agentId,
          entity: 'Transaction',
          entityId: transaction.id,
          action: 'PROCESSED',
          oldValue: { statusId: oldStatusId },
          newValue: { statusId: statusRecord.id, agentNotes, evidenceUrl },
          ipAddress: req.ip,
        });
      }

      // Notify player via Telegram
      if (transaction.playerProfile?.telegramId && telegramService.isConfigured()) {
        await telegramService.sendTransactionNotification(
          transaction.playerProfile.telegramId,
          transaction.transactionUuid,
          'processed',
          {
            status: statusRecord.label,
            agentNotes,
          }
        );
      }

      // Notify admins via Socket.IO
      if (socketService) {
        socketService.notifyAdmins({
          type: 'transaction_processed',
          transactionId: transaction.id,
          transactionUuid: transaction.transactionUuid,
          message: `Transaction processed by agent`,
          data: {
            status: statusRecord.label,
            agentId,
            agentNotes,
          },
        });
      }

      res.json({
        message: 'Transaction processed successfully',
        transaction: {
          id: transaction.id,
          transactionUuid: transaction.transactionUuid,
          status: statusRecord.label,
          agentNotes,
          evidenceUrl,
          updatedAt: transaction.updatedAt,
        },
      });
    } catch (error) {
      console.error('Process transaction error:', error);
      res.status(500).json({ 
        error: 'Failed to process transaction',
        message: 'Internal server error while processing transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Upload evidence file
   */
  static async uploadEvidence(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ 
          error: 'No file uploaded',
          message: 'Please select a file to upload'
        });
        return;
      }

      const uploadResult = await fileUploadService.uploadFile(req.file);

      res.json({
        message: 'Evidence uploaded successfully',
        fileUrl: uploadResult.url,
        filename: uploadResult.filename,
        file: {
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          mimetype: uploadResult.mimetype,
          size: uploadResult.size,
          url: uploadResult.url,
        },
      });
    } catch (error) {
      console.error('Upload evidence error:', error);
      res.status(500).json({ 
        error: 'Failed to upload evidence',
        message: 'Internal server error while uploading file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get agent statistics
   */
  static async getAgentStats(req: Request, res: Response): Promise<void> {
    try {
      const agentId = (req as any).user?.userId;

      if (!agentId) {
        res.status(401).json({ error: 'Agent ID not found' });
        return;
      }

      // Get all transactions assigned to this agent
      const transactions = await Transaction.findAll({
        where: { assignedAgentId: agentId },
        include: [{
          model: TransactionStatus,
          as: 'status',
        }],
      });

      const totalAssigned = transactions.length;
      const pending = transactions.filter(t => t.status?.code === 'PENDING').length;
      const inProgress = transactions.filter(t => t.status?.code === 'IN_PROGRESS').length;
      const completed = transactions.filter(t => t.status?.code === 'SUCCESS').length;
      const failed = transactions.filter(t => t.status?.code === 'FAILED').length;
      
      const ratings = transactions.filter(t => t.rating).map(t => t.rating!);
      const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      // Calculate total amount processed
      const totalAmount = transactions
        .filter(t => t.status?.code === 'SUCCESS')
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = transactions.filter(t => 
        t.createdAt && t.createdAt >= thirtyDaysAgo
      );

      res.json({
        stats: {
          totalAssigned,
          pending,
          inProgress,
          completed,
          failed,
          averageRating: Math.round(averageRating * 100) / 100,
          totalAmount: totalAmount.toFixed(2),
          recentActivity: recentTransactions.length,
        },
        recentTransactions: recentTransactions.slice(0, 10).map(transaction => ({
          id: transaction.id,
          transactionUuid: transaction.transactionUuid,
          type: transaction.type,
          amount: transaction.amount,
          currency: transaction.currency,
          status: transaction.status?.label,
          createdAt: transaction.createdAt,
        })),
      });
    } catch (error) {
      console.error('Get agent stats error:', error);
      res.status(500).json({ 
        error: 'Failed to get agent statistics',
        message: 'Internal server error while fetching agent statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

// Export validation middleware for routes
export const processTransactionValidation = validate(schemas.processTransaction);
export const getTasksValidation = validateQuery(
  Joi.object({
    status: Joi.string().optional(),
    dateRange: Joi.string().optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  })
);
