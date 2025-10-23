import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation middleware factory
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message),
      });
      return;
    }
    
    next();
  };
};

/**
 * Query validation middleware factory
 */
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      res.status(400).json({
        error: 'Query validation failed',
        details: error.details.map(detail => detail.message),
      });
      return;
    }
    
    next();
  };
};

/**
 * Common validation schemas
 */
export const schemas = {
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  createPlayer: Joi.object({
    telegramId: Joi.string().optional(),
    telegramUsername: Joi.string().optional(),
    languageCode: Joi.string().length(2).default('en'),
  }),

  createTransaction: Joi.object({
    playerUuid: Joi.string().uuid().required(),
    type: Joi.string().valid('DEPOSIT', 'WITHDRAW').required(),
    amount: Joi.number().positive().required(),
    currency: Joi.string().length(3).default('USD'),
    depositBankId: Joi.number().when('type', {
      is: 'DEPOSIT',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    withdrawalBankId: Joi.number().when('type', {
      is: 'WITHDRAW',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    withdrawalAddress: Joi.string().when('type', {
      is: 'WITHDRAW',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
  }),

  assignTransaction: Joi.object({
    agentId: Joi.number().required(),
  }),

  updateTransactionStatus: Joi.object({
    status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'CANCELLED').required(),
    adminNotes: Joi.string().optional(),
  }),

  processTransaction: Joi.object({
    status: Joi.string().valid('SUCCESS', 'FAILED', 'CANCELLED').required(),
    agentNotes: Joi.string().optional(),
    evidenceUrl: Joi.string().uri().optional(),
  }),

  transactionFilters: Joi.object({
    playerUuid: Joi.string().uuid().optional(),
    dateRange: Joi.string().optional(),
    status: Joi.string().optional(),
    agent: Joi.number().optional(),
    type: Joi.string().valid('DEPOSIT', 'WITHDRAW').optional(),
    amountRange: Joi.string().optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20),
  }),

  depositBank: Joi.object({
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    accountName: Joi.string().required(),
    notes: Joi.string().optional(),
    isActive: Joi.boolean().default(true),
  }),

  withdrawalBank: Joi.object({
    bankName: Joi.string().required(),
    requiredFields: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        label: Joi.string().required(),
        type: Joi.string().valid('text', 'email', 'number').required(),
        required: Joi.boolean().required(),
      })
    ).required(),
    notes: Joi.string().optional(),
    isActive: Joi.boolean().default(true),
  }),

  template: Joi.object({
    languageCode: Joi.string().length(2).required(),
    keyName: Joi.string().required(),
    content: Joi.string().required(),
  }),

  language: Joi.object({
    code: Joi.string().length(2).required(),
    name: Joi.string().required(),
    isActive: Joi.boolean().default(true),
  }),
};
