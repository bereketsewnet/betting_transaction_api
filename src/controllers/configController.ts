import { Request, Response } from 'express';
import { DepositBank, WithdrawalBank, Language, Template, Transaction } from '../models';
import { validate, schemas } from '../middlewares/validation';
import { AuditLog } from '../models';

export class ConfigController {
  /**
   * Get welcome message template
   */
  static async getWelcomeMessage(req: Request, res: Response): Promise<void> {
    try {
      const { lang = 'en' } = req.query;

      const template = await Template.findOne({
        where: {
          languageCode: lang as string,
          keyName: 'welcome_message',
        },
      });

      if (!template) {
        res.status(404).json({ error: 'Welcome message not found for this language' });
        return;
      }

      res.json({
        language: lang,
        message: template.content,
      });
    } catch (error) {
      console.error('Get welcome message error:', error);
      res.status(500).json({ error: 'Failed to get welcome message' });
    }
  }

  /**
   * Get template by key and language (with fallback to English)
   */
  static async getTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { key, lang = 'en' } = req.query;

      if (!key) {
        res.status(400).json({ error: 'Template key is required' });
        return;
      }

      // Try to get template for requested language
      let template = await Template.findOne({
        where: {
          languageCode: lang as string,
          keyName: key as string,
        },
      });

      // If not found and language is not English, fallback to English
      if (!template && lang !== 'en') {
        template = await Template.findOne({
          where: {
            languageCode: 'en',
            keyName: key as string,
          },
        });
      }

      if (!template) {
        res.status(404).json({ 
          error: 'Template not found',
          key: key as string,
          language: lang as string,
          fallbackUsed: false
        });
        return;
      }

      res.json({
        key: template.keyName,
        language: template.languageCode,
        content: template.content,
        fallbackUsed: template.languageCode === 'en' && lang !== 'en',
      });
    } catch (error) {
      console.error('Get template error:', error);
      res.status(500).json({ error: 'Failed to get template' });
    }
  }

  /**
   * Get active deposit banks
   */
  static async getDepositBanks(req: Request, res: Response): Promise<void> {
    try {
      const banks = await DepositBank.findAll({
        where: { isActive: true },
        attributes: ['id', 'bankName', 'accountNumber', 'accountName', 'notes'],
        order: [['bankName', 'ASC']],
      });

      res.json({ banks });
    } catch (error) {
      console.error('Get deposit banks error:', error);
      res.status(500).json({ error: 'Failed to get deposit banks' });
    }
  }

  /**
   * Get active withdrawal banks
   */
  static async getWithdrawalBanks(req: Request, res: Response): Promise<void> {
    try {
      const banks = await WithdrawalBank.findAll({
        where: { isActive: true },
        attributes: ['id', 'bankName', 'requiredFields', 'notes'],
        order: [['bankName', 'ASC']],
      });

      res.json({ banks });
    } catch (error) {
      console.error('Get withdrawal banks error:', error);
      res.status(500).json({ error: 'Failed to get withdrawal banks' });
    }
  }

  /**
   * Get active languages
   */
  static async getLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await Language.findAll({
        where: { isActive: true },
        attributes: ['code', 'name'],
        order: [['name', 'ASC']],
      });

      res.json({ languages });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({ error: 'Failed to get languages' });
    }
  }
}

export class AdminConfigController {
  /**
   * CRUD operations for deposit banks
   */
  static async getDepositBanks(req: Request, res: Response): Promise<void> {
    try {
      const banks = await DepositBank.findAll({
        order: [['bankName', 'ASC']],
      });

      res.json({ banks });
    } catch (error) {
      console.error('Get deposit banks error:', error);
      res.status(500).json({ error: 'Failed to get deposit banks' });
    }
  }

  static async createDepositBank(req: Request, res: Response): Promise<void> {
    try {
      const bank = await DepositBank.create(req.body);

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'DepositBank',
        entityId: bank.id,
        action: 'CREATED',
        newValue: req.body,
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'Deposit bank created successfully',
        bank,
      });
    } catch (error) {
      console.error('Create deposit bank error:', error);
      res.status(500).json({ error: 'Failed to create deposit bank' });
    }
  }

  static async updateDepositBank(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bank = await DepositBank.findByPk(id);

      if (!bank) {
        res.status(404).json({ error: 'Deposit bank not found' });
        return;
      }

      const oldValues = bank.toJSON();
      await bank.update(req.body);

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'DepositBank',
        entityId: bank.id,
        action: 'UPDATED',
        oldValue: oldValues,
        newValue: req.body,
        ipAddress: req.ip,
      });

      res.json({
        message: 'Deposit bank updated successfully',
        bank,
      });
    } catch (error) {
      console.error('Update deposit bank error:', error);
      res.status(500).json({ error: 'Failed to update deposit bank' });
    }
  }

  static async deleteDepositBank(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bank = await DepositBank.findByPk(id);

      if (!bank) {
        res.status(404).json({ error: 'Deposit bank not found' });
        return;
      }

      // Check if there are transactions using this deposit bank
      const transactionsCount = await Transaction.count({
        where: { depositBankId: parseInt(id) },
      });

      if (transactionsCount > 0) {
        res.status(400).json({
          error: 'Cannot delete deposit bank',
          message: `This deposit bank is being used by ${transactionsCount} transaction(s) and cannot be deleted. Please transfer or remove the transactions first, or deactivate the bank instead.`,
          transactionsCount,
        });
        return;
      }

      await bank.destroy();

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'DepositBank',
        entityId: parseInt(id),
        action: 'DELETED',
        oldValue: bank.toJSON(),
        ipAddress: req.ip,
      });

      res.json({ message: 'Deposit bank deleted successfully' });
    } catch (error: any) {
      console.error('Delete deposit bank error:', error);
      
      // Handle foreign key constraint error specifically
      if (error.name === 'SequelizeForeignKeyConstraintError' || error.parent?.code === 'ER_ROW_IS_REFERENCED_2') {
        res.status(400).json({
          error: 'Cannot delete deposit bank',
          message: 'This deposit bank is being used by one or more transactions and cannot be deleted. Please transfer or remove the transactions first, or deactivate the bank instead.',
        });
        return;
      }
      
      res.status(500).json({ error: 'Failed to delete deposit bank' });
    }
  }

  /**
   * CRUD operations for withdrawal banks
   */
  static async getWithdrawalBanks(req: Request, res: Response): Promise<void> {
    try {
      const banks = await WithdrawalBank.findAll({
        order: [['bankName', 'ASC']],
      });

      res.json({ banks });
    } catch (error) {
      console.error('Get withdrawal banks error:', error);
      res.status(500).json({ error: 'Failed to get withdrawal banks' });
    }
  }

  static async createWithdrawalBank(req: Request, res: Response): Promise<void> {
    try {
      const bank = await WithdrawalBank.create(req.body);

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'WithdrawalBank',
        entityId: bank.id,
        action: 'CREATED',
        newValue: req.body,
        ipAddress: req.ip,
      });

      res.status(201).json({
        message: 'Withdrawal bank created successfully',
        bank,
      });
    } catch (error) {
      console.error('Create withdrawal bank error:', error);
      res.status(500).json({ error: 'Failed to create withdrawal bank' });
    }
  }

  static async updateWithdrawalBank(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bank = await WithdrawalBank.findByPk(id);

      if (!bank) {
        res.status(404).json({ error: 'Withdrawal bank not found' });
        return;
      }

      const oldValues = bank.toJSON();
      await bank.update(req.body);

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'WithdrawalBank',
        entityId: bank.id,
        action: 'UPDATED',
        oldValue: oldValues,
        newValue: req.body,
        ipAddress: req.ip,
      });

      res.json({
        message: 'Withdrawal bank updated successfully',
        bank,
      });
    } catch (error) {
      console.error('Update withdrawal bank error:', error);
      res.status(500).json({ error: 'Failed to update withdrawal bank' });
    }
  }

  static async deleteWithdrawalBank(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const bank = await WithdrawalBank.findByPk(id);

      if (!bank) {
        res.status(404).json({ error: 'Withdrawal bank not found' });
        return;
      }

      // Check if there are transactions using this withdrawal bank
      const transactionsCount = await Transaction.count({
        where: { withdrawalBankId: parseInt(id) },
      });

      if (transactionsCount > 0) {
        res.status(400).json({
          error: 'Cannot delete withdrawal bank',
          message: `This withdrawal bank is being used by ${transactionsCount} transaction(s) and cannot be deleted. Please transfer or remove the transactions first, or deactivate the bank instead.`,
          transactionsCount,
        });
        return;
      }

      await bank.destroy();

      // Create audit log
      await AuditLog.create({
        actorUserId: req.user!.userId,
        entity: 'WithdrawalBank',
        entityId: parseInt(id),
        action: 'DELETED',
        oldValue: bank.toJSON(),
        ipAddress: req.ip,
      });

      res.json({ message: 'Withdrawal bank deleted successfully' });
    } catch (error: any) {
      console.error('Delete withdrawal bank error:', error);
      
      // Handle foreign key constraint error specifically
      if (error.name === 'SequelizeForeignKeyConstraintError' || error.parent?.code === 'ER_ROW_IS_REFERENCED_2') {
        res.status(400).json({
          error: 'Cannot delete withdrawal bank',
          message: 'This withdrawal bank is being used by one or more transactions and cannot be deleted. Please transfer or remove the transactions first, or deactivate the bank instead.',
        });
        return;
      }
      
      res.status(500).json({ error: 'Failed to delete withdrawal bank' });
    }
  }

  /**
   * CRUD operations for templates
   */
  static async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const templates = await Template.findAll({
        include: [{
          model: Language,
          as: 'language',
        }],
        order: [['languageCode', 'ASC'], ['keyName', 'ASC']],
      });

      res.json({ templates });
    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({ error: 'Failed to get templates' });
    }
  }

  static async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const template = await Template.create(req.body);

      res.status(201).json({
        message: 'Template created successfully',
        template,
      });
    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  static async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const template = await Template.findByPk(id);

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      await template.update(req.body);

      res.json({
        message: 'Template updated successfully',
        template,
      });
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  static async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const template = await Template.findByPk(id);

      if (!template) {
        res.status(404).json({ error: 'Template not found' });
        return;
      }

      await template.destroy();

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  /**
   * CRUD operations for languages
   */
  static async getLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await Language.findAll({
        order: [['name', 'ASC']],
      });

      res.json({ languages });
    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({ error: 'Failed to get languages' });
    }
  }

  static async createLanguage(req: Request, res: Response): Promise<void> {
    try {
      const language = await Language.create(req.body);

      res.status(201).json({
        message: 'Language created successfully',
        language,
      });
    } catch (error) {
      console.error('Create language error:', error);
      res.status(500).json({ error: 'Failed to create language' });
    }
  }

  static async updateLanguage(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const language = await Language.findByPk(code);

      if (!language) {
        res.status(404).json({ error: 'Language not found' });
        return;
      }

      await language.update(req.body);

      res.json({
        message: 'Language updated successfully',
        language,
      });
    } catch (error) {
      console.error('Update language error:', error);
      res.status(500).json({ error: 'Failed to update language' });
    }
  }

  static async deleteLanguage(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.params;
      const language = await Language.findByPk(code);

      if (!language) {
        res.status(404).json({ error: 'Language not found' });
        return;
      }

      await language.destroy();

      res.json({ message: 'Language deleted successfully' });
    } catch (error) {
      console.error('Delete language error:', error);
      res.status(500).json({ error: 'Failed to delete language' });
    }
  }
}

// Export validation middleware for routes
export const depositBankValidation = validate(schemas.depositBank);
export const withdrawalBankValidation = validate(schemas.withdrawalBank);
export const templateValidation = validate(schemas.template);
export const languageValidation = validate(schemas.language);
