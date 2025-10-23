import { Request, Response } from 'express';
import { BettingSite } from '../models/BettingSite';
import { AuditLog } from '../models/AuditLog';
import Joi from 'joi';

// Validation schemas
const createBettingSiteSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  isActive: Joi.boolean().default(true),
});

const updateBettingSiteSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional(),
});

export class BettingSiteController {
  /**
   * Get all betting sites (public endpoint)
   */
  static async getAllBettingSites(req: Request, res: Response): Promise<void> {
    try {
      const { isActive } = req.query;
      
      const whereClause: any = {};
      if (isActive !== undefined) {
        whereClause.isActive = isActive === 'true';
      }

      const bettingSites = await BettingSite.findAll({
        where: whereClause,
        order: [['name', 'ASC']],
      });

      res.json({
        bettingSites,
        total: bettingSites.length,
      });
    } catch (error) {
      console.error('Get betting sites error:', error);
      res.status(500).json({
        error: 'Failed to fetch betting sites',
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get betting site by ID (public endpoint)
   */
  static async getBettingSiteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const bettingSite = await BettingSite.findByPk(id);

      if (!bettingSite) {
        res.status(404).json({
          error: 'Betting site not found',
        });
        return;
      }

      res.json({ bettingSite });
    } catch (error) {
      console.error('Get betting site error:', error);
      res.status(500).json({
        error: 'Failed to fetch betting site',
        message: 'Internal server error',
      });
    }
  }

  /**
   * Create new betting site (admin only)
   */
  static async createBettingSite(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = createBettingSiteSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => d.message),
        });
        return;
      }

      const bettingSite = await BettingSite.create(value);

      // Create audit log
      if ((req as any).user?.id) {
        await AuditLog.create({
          entity: 'BettingSite',
          entityId: bettingSite.id,
          action: 'CREATE',
          actorUserId: (req as any).user.id,
          oldValue: null,
          newValue: JSON.stringify(bettingSite.toJSON()),
          ipAddress: req.ip,
        });
      }

      res.status(201).json({
        message: 'Betting site created successfully',
        bettingSite,
      });
    } catch (error) {
      console.error('Create betting site error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          res.status(409).json({
            error: 'Betting site already exists',
            message: 'A betting site with this name already exists',
          });
          return;
        }
        if (error.message.includes('Validation error')) {
          res.status(400).json({
            error: 'Validation failed',
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        error: 'Failed to create betting site',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  }

  /**
   * Update betting site (admin only)
   */
  static async updateBettingSite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateBettingSiteSchema.validate(req.body);
      
      if (error) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.details.map(d => d.message),
        });
        return;
      }

      const bettingSite = await BettingSite.findByPk(id);
      if (!bettingSite) {
        res.status(404).json({
          error: 'Betting site not found',
        });
        return;
      }

      const oldValue = JSON.stringify(bettingSite.toJSON());
      await bettingSite.update(value);
      const newValue = JSON.stringify(bettingSite.toJSON());

      // Create audit log
      if ((req as any).user?.id) {
        await AuditLog.create({
          entity: 'BettingSite',
          entityId: bettingSite.id,
          action: 'UPDATE',
          actorUserId: (req as any).user.id,
          oldValue,
          newValue,
          ipAddress: req.ip,
        });
      }

      res.json({
        message: 'Betting site updated successfully',
        bettingSite,
      });
    } catch (error) {
      console.error('Update betting site error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          res.status(409).json({
            error: 'Betting site name already exists',
            message: 'A betting site with this name already exists',
          });
          return;
        }
        if (error.message.includes('Validation error')) {
          res.status(400).json({
            error: 'Validation failed',
            message: error.message,
          });
          return;
        }
      }
      res.status(500).json({
        error: 'Failed to update betting site',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  }

  /**
   * Delete betting site (admin only)
   */
  static async deleteBettingSite(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const bettingSite = await BettingSite.findByPk(id);
      if (!bettingSite) {
        res.status(404).json({
          error: 'Betting site not found',
        });
        return;
      }

      const oldValue = JSON.stringify(bettingSite.toJSON());
      await bettingSite.destroy();

      // Create audit log
      if ((req as any).user?.id) {
        await AuditLog.create({
          entity: 'BettingSite',
          entityId: parseInt(id),
          action: 'DELETE',
          actorUserId: (req as any).user.id,
          oldValue,
          newValue: null,
          ipAddress: req.ip,
        });
      }

      res.json({
        message: 'Betting site deleted successfully',
      });
    } catch (error) {
      console.error('Delete betting site error:', error);
      res.status(500).json({
        error: 'Failed to delete betting site',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  }

  /**
   * Toggle betting site status (admin only)
   */
  static async toggleBettingSiteStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const bettingSite = await BettingSite.findByPk(id);
      if (!bettingSite) {
        res.status(404).json({
          error: 'Betting site not found',
        });
        return;
      }

      const oldValue = JSON.stringify(bettingSite.toJSON());
      await bettingSite.update({ isActive: !bettingSite.isActive });
      const newValue = JSON.stringify(bettingSite.toJSON());

      // Create audit log
      if ((req as any).user?.id) {
        await AuditLog.create({
          entity: 'BettingSite',
          entityId: bettingSite.id,
          action: 'UPDATE',
          actorUserId: (req as any).user.id,
          oldValue,
          newValue,
          ipAddress: req.ip,
        });
      }

      res.json({
        message: `Betting site ${bettingSite.isActive ? 'activated' : 'deactivated'} successfully`,
        bettingSite,
      });
    } catch (error) {
      console.error('Toggle betting site status error:', error);
      res.status(500).json({
        error: 'Failed to toggle betting site status',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
      });
    }
  }
}
