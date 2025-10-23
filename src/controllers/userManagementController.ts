import { Request, Response } from 'express';
import { User, Role, PlayerProfile, AuditLog } from '../models';
import { Op } from 'sequelize';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const createUserSchema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  displayName: Joi.string().min(2).max(100).required(),
  roleId: Joi.number().integer().min(1).required(),
  phone: Joi.string().max(20).optional(),
  isActive: Joi.boolean().optional()
});

const updateUserSchema = Joi.object({
  username: Joi.string().email().optional(),
  displayName: Joi.string().min(2).max(100).optional(),
  roleId: Joi.number().integer().min(1).optional(),
  phone: Joi.string().max(20).optional(),
  isActive: Joi.boolean().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required()
});

const adminChangePasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required()
});

// Register new user (admin only)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const { username, password, displayName, roleId, phone, isActive = true } = value;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      res.status(409).json({
        error: 'User already exists',
        message: 'A user with this username already exists'
      });
      return;
    }

    // Verify role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      res.status(400).json({
        error: 'Invalid role',
        message: 'The specified role does not exist'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await User.create({
      username,
      email: username, // username should already be an email format
      passwordHash: hashedPassword,
      displayName,
      phone,
      roleId,
      isActive
    });

    // Log audit (only if there's an authenticated user)
    if ((req as any).user?.id) {
      await AuditLog.create({
        action: 'USER_CREATED',
        entity: 'User',
        entityId: user.id,
        actorUserId: (req as any).user.id,
        newValue: {
          createdUser: username,
          role: role.name,
          createdBy: (req as any).user.username
        }
      });
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: role.name,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Register user error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Duplicate entry')) {
        res.status(409).json({
          error: 'User already exists',
          message: 'A user with this username or email already exists'
        });
        return;
      }
      
      if (error.message.includes('Validation error')) {
        res.status(400).json({
          error: 'Validation failed',
          message: error.message
        });
        return;
      }
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create user',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {};
    
    if (role) {
      whereClause.roleId = role;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { displayName: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['passwordHash'] },
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Get role statistics
    const roleStats = await User.findAll({
      attributes: [
        'roleId',
        [User.sequelize!.fn('COUNT', User.sequelize!.col('User.id')), 'count']
      ],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name']
        }
      ],
      group: ['roleId', 'role.id', 'role.name'],
      raw: false
    });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      },
      statistics: {
        totalUsers: count,
        roleDistribution: roleStats.map((stat: any) => ({
          role: stat.role.name,
          count: stat.dataValues.count
        }))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
      return;
    }

    res.json({
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user'
    });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
      return;
    }

    // Check if username is being changed and if it's already taken
    if (value.username && value.username !== user.username) {
      const existingUser = await User.findOne({
        where: { username: value.username }
      });
      
      if (existingUser) {
        res.status(409).json({
          error: 'Username already exists',
          message: 'A user with this username already exists'
        });
        return;
      }
    }

    // Verify role exists if being changed
    if (value.roleId) {
      const role = await Role.findByPk(value.roleId);
      if (!role) {
        res.status(400).json({
          error: 'Invalid role',
          message: 'The specified role does not exist'
        });
        return;
      }
    }

    // Update user
    await user.update(value);

    // Get updated user with role
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name']
        }
      ],
      attributes: { exclude: ['passwordHash'] }
    });

    // Log audit (only if there's an authenticated user)
    if ((req as any).user?.id) {
      await AuditLog.create({
        action: 'USER_UPDATED',
        entity: 'User',
        entityId: user.id,
        actorUserId: (req as any).user.id,
        newValue: {
          updatedUser: user.username,
          changes: value,
          updatedBy: (req as any).user.username
        }
      });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update user'
    });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
      return;
    }

    // Prevent self-deletion
    if (user.id === (req as any).user?.id) {
      res.status(400).json({
        error: 'Cannot delete self',
        message: 'You cannot delete your own account'
      });
      return;
    }

    // Check if user has any transactions or player profiles
    const hasTransactions = await PlayerProfile.findOne({
      where: { userId: user.id }
    });

    if (hasTransactions) {
      res.status(400).json({
        error: 'Cannot delete user',
        message: 'User has associated data and cannot be deleted'
      });
      return;
    }

    // Log audit before deletion (only if there's an authenticated user)
    if ((req as any).user?.id) {
      await AuditLog.create({
        action: 'USER_DELETED',
        entity: 'User',
        entityId: user.id,
        actorUserId: (req as any).user.id,
        newValue: {
          deletedUser: user.username,
          deletedBy: (req as any).user.username
        }
      });
    }

    await user.destroy();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete user'
    });
  }
};

// Change user password (admin only)
export const adminChangePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error, value } = adminChangePasswordSchema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(value.newPassword, saltRounds);

    // Update password
    await user.update({ passwordHash: hashedPassword });

    // Log audit (only if there's an authenticated user)
    if ((req as any).user?.id) {
      await AuditLog.create({
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: user.id,
        actorUserId: (req as any).user.id,
        newValue: {
          targetUser: user.username,
          changedBy: (req as any).user.username
        }
      });
    }

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Admin change password error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to change password'
    });
  }
};

// Toggle user active status (admin only)
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
      return;
    }

    // Prevent self-deactivation
    if (user.id === (req as any).user?.id) {
      res.status(400).json({
        error: 'Cannot deactivate self',
        message: 'You cannot deactivate your own account'
      });
      return;
    }

    const newStatus = !user.isActive;
    await user.update({ isActive: newStatus });

    // Log audit (only if there's an authenticated user)
    if ((req as any).user?.id) {
      await AuditLog.create({
        action: newStatus ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        entity: 'User',
        entityId: user.id,
        actorUserId: (req as any).user.id,
        newValue: {
          targetUser: user.username,
          newStatus,
          changedBy: (req as any).user.username
        }
      });
    }

    res.json({
      message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        username: user.username,
        isActive: newStatus
      }
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to toggle user status'
    });
  }
};

// Get all roles
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    res.json({
      roles
    });
  } catch (error) {
    console.error('Get all roles error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch roles'
    });
  }
};

// Get user statistics (admin only)
export const getUserStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    // Role distribution
    const roleStats = await User.findAll({
      attributes: [
        'roleId',
        [User.sequelize!.fn('COUNT', User.sequelize!.col('User.id')), 'count']
      ],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['name']
        }
      ],
      group: ['roleId', 'role.id', 'role.name'],
      raw: false
    });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        recentUsers,
        roleDistribution: roleStats.map((stat: any) => ({
          role: stat.role.name,
          count: stat.dataValues.count
        }))
      }
    });
  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user statistics'
    });
  }
};
