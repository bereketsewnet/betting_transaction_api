import { Request, Response } from 'express';
import { Transaction, TransactionStatus, User, PlayerProfile, DepositBank, WithdrawalBank, BettingSite, AuditLog, Role, TransactionEvidence, TransactionComment } from '../models';
import { validate, schemas, validateQuery } from '../middlewares/validation';
import { socketService } from '../services/socketService';
import { telegramService } from '../services/telegramService';
import { Op } from 'sequelize';

export class AdminController {
  /**
   * Get all transactions with filters (admin only)
   */
  static async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const {
        dateRange,
        status,
        agent,
        type,
        amountRange,
        page = 1,
        limit = 20,
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = {};

      // Apply filters
      if (status) {
        const statusRecord = await TransactionStatus.findOne({ where: { code: status as string } });
        if (statusRecord) {
          whereClause.statusId = statusRecord.id;
        }
      }

      if (agent) {
        whereClause.assignedAgentId = agent;
      }

      if (type) {
        whereClause.type = type;
      }

      if (amountRange) {
        const [min, max] = (amountRange as string).split('-').map(Number);
        whereClause.amount = {
          [Op.gte]: min,
          [Op.lte]: max,
        };
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
            model: User,
            as: 'assignedAgent',
            required: false,
            attributes: ['id', 'username', 'displayName'],
          },
          {
            model: BettingSite,
            as: 'bettingSite',
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
          bettingSiteId: transaction.bettingSiteId,
          playerSiteId: transaction.playerSiteId,
          bettingSite: transaction.bettingSite,
          requestedAt: transaction.requestedAt,
          assignedAgent: transaction.assignedAgent,
          adminNotes: transaction.adminNotes,
          agentNotes: transaction.agentNotes,
          rating: transaction.rating,
          playerProfile: {
            id: transaction.playerProfile?.id,
            playerUuid: transaction.playerProfile?.playerUuid,
            telegramUsername: transaction.playerProfile?.telegramUsername,
          },
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
      console.error('Get transactions error:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  }

  /**
   * Get recent transactions (last 24 hours) - Admin only
   */
  static async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Calculate 24 hours ago
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: {
          createdAt: {
            [Op.gte]: twentyFourHoursAgo,
          },
        },
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
            model: BettingSite,
            as: 'bettingSite',
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
          status: transaction.status?.code || 'PENDING',
          statusName: transaction.status?.name || 'Pending',
          playerProfile: transaction.playerProfile ? {
            id: transaction.playerProfile.id,
            playerUuid: transaction.playerProfile.playerUuid,
            telegramId: transaction.playerProfile.telegramId,
            telegramUsername: transaction.playerProfile.telegramUsername,
            displayName: transaction.playerProfile.displayName,
          } : null,
          depositBank: transaction.depositBank,
          withdrawalBank: transaction.withdrawalBank,
          withdrawalAddress: transaction.withdrawalAddress,
          bettingSite: transaction.bettingSite,
          playerSiteId: transaction.playerSiteId,
          assignedAgent: transaction.assignedAgent,
          requestedAt: transaction.requestedAt,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })),
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
        filters: {
          dateRange: 'last24hours',
        },
      });
    } catch (error: any) {
      console.error('Error fetching recent transactions:', error);
      res.status(500).json({ error: 'Failed to fetch recent transactions' });
    }
  }

  /**
   * Assign transaction to agent
   */
  static async assignTransaction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { agentId } = req.body;

      const transaction = await Transaction.findByPk(id, {
        include: [
          {
            model: PlayerProfile,
            as: 'playerProfile',
          },
          {
            model: User,
            as: 'assignedAgent',
            required: false,
          },
        ],
      });

      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      const agent = await User.findByPk(agentId, {
        include: [{
          model: Role,
          as: 'role',
        }],
      });

      if (!agent || agent.role?.name !== 'agent') {
        res.status(400).json({ error: 'Invalid agent' });
        return;
      }

      const oldAgentId = transaction.assignedAgentId;
      await transaction.update({ assignedAgentId: agentId });

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'Transaction',
        entityId: transaction.id,
        action: 'ASSIGNED',
        oldValue: { assignedAgentId: oldAgentId },
        newValue: { assignedAgentId: agentId },
        ipAddress: req.ip,
      });

      // Notify agent via Socket.IO
      if (socketService) {
        socketService.notifyAgent(agentId, {
          type: 'transaction_assigned',
          transactionId: transaction.id,
          transactionUuid: transaction.transactionUuid,
          message: 'New transaction assigned to you',
          data: {
            amount: transaction.amount,
            currency: transaction.currency,
            type: transaction.type,
            playerUuid: transaction.playerProfile?.playerUuid,
          },
        });
      }

      res.json({
        message: 'Transaction assigned successfully',
        transaction: {
          id: transaction.id,
          transactionUuid: transaction.transactionUuid,
          assignedAgentId: agentId,
          assignedAgent: {
            id: agent.id,
            username: agent.username,
            displayName: agent.displayName,
          },
        },
      });
    } catch (error) {
      console.error('Assign transaction error:', error);
      res.status(500).json({ error: 'Failed to assign transaction' });
    }
  }

  /**
   * Update transaction status (admin only)
   */
  static async updateTransactionStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

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
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }

      const statusRecord = await TransactionStatus.findOne({ where: { code: status } });
      if (!statusRecord) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      const oldStatusId = transaction.statusId;
      await transaction.update({
        statusId: statusRecord.id,
        adminNotes,
      });

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'Transaction',
        entityId: transaction.id,
        action: 'STATUS_UPDATED',
        oldValue: { statusId: oldStatusId },
        newValue: { statusId: statusRecord.id, adminNotes },
        ipAddress: req.ip,
      });

      // Notify player via Telegram if status changed to SUCCESS or FAILED
      if (['SUCCESS', 'FAILED'].includes(status) && transaction.playerProfile?.telegramId) {
        await telegramService.sendTransactionNotification(
          transaction.playerProfile.telegramId,
          transaction.transactionUuid,
          'processed',
          {
            status: statusRecord.label,
            adminNotes,
          }
        );
      }

      res.json({
        message: 'Transaction status updated successfully',
        transaction: {
          id: transaction.id,
          transactionUuid: transaction.transactionUuid,
          status: statusRecord.label,
          adminNotes,
        },
      });
    } catch (error) {
      console.error('Update transaction status error:', error);
      res.status(500).json({ error: 'Failed to update transaction status' });
    }
  }

  /**
   * Get agents with statistics
   */
  static async getAgents(req: Request, res: Response): Promise<void> {
    try {
      // Get agent role ID by querying the database
      const agentRole = await Role.findOne({
        where: { name: 'agent' },
      });

      if (!agentRole) {
        res.status(500).json({ 
          error: 'Agent role not found',
          message: 'Unable to find agent role in database. Please ensure roles are properly seeded.'
        });
        return;
      }

      const agents = await User.findAll({
        where: {
          roleId: agentRole.id,
          isActive: true,
        },
        include: [{
          model: Role,
          as: 'role',
        }],
        attributes: ['id', 'username', 'displayName', 'email', 'isActive', 'createdAt'],
      });

      const agentsWithStats = await Promise.all(
        agents.map(async (agent) => {
          // Get last 100 transactions for this agent
          const lastTransactions = await Transaction.findAll({
            where: { assignedAgentId: agent.id },
            include: [{
              model: TransactionStatus,
              as: 'status',
            }],
            order: [['createdAt', 'DESC']],
            limit: 100,
          });

          const completed = lastTransactions.filter(t => t.status?.code === 'SUCCESS').length;
          const pending = lastTransactions.filter(t => ['PENDING', 'IN_PROGRESS'].includes(t.status?.code || '')).length;
          const failed = lastTransactions.filter(t => t.status?.code === 'FAILED').length;
          
          const ratings = lastTransactions.filter(t => t.rating).map(t => t.rating!);
          const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

          return {
            id: agent.id,
            username: agent.username,
            displayName: agent.displayName,
            email: agent.email,
            isActive: agent.isActive,
            createdAt: agent.createdAt,
            stats: {
              completed,
              pending,
              failed,
              avgRating: Math.round(avgRating * 100) / 100,
              totalTransactions: lastTransactions.length,
            },
          };
        })
      );

      res.json({ agents: agentsWithStats });
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ error: 'Failed to get agents' });
    }
  }

  /**
   * Delete a transaction (admin only)
   */
  static async deleteTransaction(req: Request, res: Response): Promise<void> {
    console.log(`DELETE /admin/transactions/:id called with id: ${req.params.id}`);
    try {
      const { id } = req.params;
      const transactionId = parseInt(id, 10);
      
      if (isNaN(transactionId)) {
        res.status(400).json({ 
          error: 'Invalid transaction ID',
          message: 'Transaction ID must be a valid number'
        });
        return;
      }
      
      console.log(`Attempting to delete transaction with ID: ${transactionId}`);
      
      // Find transaction first (simple lookup to ensure it exists)
      const transaction = await Transaction.findByPk(transactionId);

      if (!transaction) {
        console.log(`Transaction with ID ${transactionId} not found in database`);
        res.status(404).json({ 
          error: 'Transaction not found',
          message: `Transaction with ID ${transactionId} does not exist`
        });
        return;
      }
      
      console.log(`Transaction found: ${transaction.id} - ${transaction.transactionUuid}`);

      // Get related data separately if needed
      const transactionData = transaction.toJSON();
      
      // Get related records for deletion
      const comments = await TransactionComment.findAll({
        where: { transactionId: transaction.id },
      });

      const evidence = await TransactionEvidence.findAll({
        where: { transactionId: transaction.id },
      });

      // Get player profile for notifications
      const playerProfile = await PlayerProfile.findByPk(transaction.playerProfileId);

      // Delete related records first (comments and evidence)
      if (comments.length > 0) {
        await TransactionComment.destroy({
          where: { transactionId: transaction.id },
        });
      }

      if (evidence.length > 0) {
        await TransactionEvidence.destroy({
          where: { transactionId: transaction.id },
        });
      }

      // Delete the transaction
      await transaction.destroy();

      // Create audit log
      if ((req as any).user?.id) {
        await AuditLog.create({
          actorUserId: (req as any).user.id,
          entity: 'Transaction',
          entityId: parseInt(id),
          action: 'DELETED',
          oldValue: transactionData,
          ipAddress: req.ip,
        });
      }

      // Send socket notification
      try {
        // Emit transaction deleted event to all connected admins
        (socketService as any).io?.emit('transaction:deleted', {
          transactionId: transaction.id,
          transactionUuid: transaction.transactionUuid,
          type: 'transaction_deleted',
          message: `Transaction ${transaction.transactionUuid} has been deleted`,
        });
      } catch (socketError) {
        console.warn('Socket notification failed:', socketError);
      }

      // Telegram notification can be added later if needed
      // For now, transaction deletion is logged in audit logs

      res.json({ 
        message: 'Transaction deleted successfully',
        transactionUuid: transaction.transactionUuid,
      });
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      
      // Handle foreign key constraint errors
      if (error.name === 'SequelizeForeignKeyConstraintError') {
        res.status(400).json({
          error: 'Cannot delete transaction',
          message: 'This transaction has related records that prevent deletion. Please contact system administrator.',
        });
        return;
      }
      
      res.status(500).json({ 
        error: 'Failed to delete transaction',
        message: 'Internal server error while deleting transaction',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

// Export validation middleware for routes
export const assignTransactionValidation = validate(schemas.assignTransaction);
export const updateTransactionStatusValidation = validate(schemas.updateTransactionStatus);
export const getTransactionsValidation = validateQuery(schemas.transactionFilters);
