import { Router } from 'express';
import { AuthController, loginValidation, refreshTokenValidation, changePasswordValidation } from '../controllers/authController';
import { PlayerController, createPlayerValidation, updatePlayerValidation } from '../controllers/playerController';
import { TransactionController, createTransactionValidation, getTransactionsByPlayerValidation } from '../controllers/transactionController';
import { AdminController, assignTransactionValidation, updateTransactionStatusValidation, getTransactionsValidation } from '../controllers/adminController';
import { AgentController, processTransactionValidation, getTasksValidation } from '../controllers/agentController';
import { ConfigController, AdminConfigController, depositBankValidation, withdrawalBankValidation, templateValidation, languageValidation } from '../controllers/configController';
import { UploadController } from '../controllers/uploadController';
import { authenticateToken, requireAdmin, requireAgentOrAdmin, requirePlayerOrAbove, optionalAuth } from '../middlewares/auth';
import { publicRateLimit, transactionRateLimit, authRateLimit } from '../middlewares/index';
import { fileUploadService } from '../services/fileUpload';

const router = Router();

// Auth routes
router.post('/auth/login', authRateLimit, loginValidation, AuthController.login);
router.post('/auth/refresh', refreshTokenValidation, AuthController.refresh);
router.post('/auth/logout', refreshTokenValidation, AuthController.logout);
router.get('/auth/profile', authenticateToken, AuthController.profile);
router.put('/auth/change-password', authenticateToken, changePasswordValidation, AuthController.changePassword);

// Public config routes
router.get('/config/welcome', ConfigController.getWelcomeMessage);
router.get('/config/deposit-banks', ConfigController.getDepositBanks);
router.get('/config/withdrawal-banks', ConfigController.getWithdrawalBanks);
router.get('/config/languages', ConfigController.getLanguages);

// Public player routes
router.post('/players', publicRateLimit, createPlayerValidation, PlayerController.createPlayer);
router.get('/players/:playerUuid', PlayerController.getPlayerByUuid);
router.put('/players/:playerUuid', updatePlayerValidation, PlayerController.updatePlayer);

// Public transaction routes
router.post('/transactions', transactionRateLimit, fileUploadService.getMulterConfig().single('screenshot'), createTransactionValidation, TransactionController.createTransaction);
router.get('/transactions', getTransactionsByPlayerValidation, TransactionController.getTransactionsByPlayer);
router.get('/transactions/:id', optionalAuth, TransactionController.getTransaction);

// Admin routes
router.get('/admin/transactions', authenticateToken, requireAdmin, getTransactionsValidation, AdminController.getTransactions);
router.put('/admin/transactions/:id/assign', authenticateToken, requireAdmin, assignTransactionValidation, AdminController.assignTransaction);
router.put('/admin/transactions/:id/status', authenticateToken, requireAdmin, updateTransactionStatusValidation, AdminController.updateTransactionStatus);
router.get('/admin/agents', authenticateToken, requireAdmin, AdminController.getAgents);

// Admin config routes
router.get('/admin/deposit-banks', authenticateToken, requireAdmin, AdminConfigController.getDepositBanks);
router.post('/admin/deposit-banks', authenticateToken, requireAdmin, depositBankValidation, AdminConfigController.createDepositBank);
router.put('/admin/deposit-banks/:id', authenticateToken, requireAdmin, depositBankValidation, AdminConfigController.updateDepositBank);
router.delete('/admin/deposit-banks/:id', authenticateToken, requireAdmin, AdminConfigController.deleteDepositBank);

router.get('/admin/withdrawal-banks', authenticateToken, requireAdmin, AdminConfigController.getWithdrawalBanks);
router.post('/admin/withdrawal-banks', authenticateToken, requireAdmin, withdrawalBankValidation, AdminConfigController.createWithdrawalBank);
router.put('/admin/withdrawal-banks/:id', authenticateToken, requireAdmin, withdrawalBankValidation, AdminConfigController.updateWithdrawalBank);
router.delete('/admin/withdrawal-banks/:id', authenticateToken, requireAdmin, AdminConfigController.deleteWithdrawalBank);

router.get('/admin/templates', authenticateToken, requireAdmin, AdminConfigController.getTemplates);
router.post('/admin/templates', authenticateToken, requireAdmin, templateValidation, AdminConfigController.createTemplate);
router.put('/admin/templates/:id', authenticateToken, requireAdmin, templateValidation, AdminConfigController.updateTemplate);
router.delete('/admin/templates/:id', authenticateToken, requireAdmin, AdminConfigController.deleteTemplate);

router.get('/admin/languages', authenticateToken, requireAdmin, AdminConfigController.getLanguages);
router.post('/admin/languages', authenticateToken, requireAdmin, languageValidation, AdminConfigController.createLanguage);
router.put('/admin/languages/:code', authenticateToken, requireAdmin, languageValidation, AdminConfigController.updateLanguage);
router.delete('/admin/languages/:code', authenticateToken, requireAdmin, AdminConfigController.deleteLanguage);

// Agent routes
router.get('/agent/tasks', authenticateToken, requireAgentOrAdmin, getTasksValidation, AgentController.getTasks);
router.put('/agent/transactions/:id/process', authenticateToken, requireAgentOrAdmin, processTransactionValidation, AgentController.processTransaction);
router.post('/agent/evidence', authenticateToken, requireAgentOrAdmin, fileUploadService.getMulterConfig().single('file'), AgentController.uploadEvidence);
router.get('/agent/stats', authenticateToken, requireAgentOrAdmin, AgentController.getAgentStats);

// Upload routes
router.post('/uploads', authenticateToken, requirePlayerOrAbove, fileUploadService.getMulterConfig().single('file'), UploadController.uploadFile);
router.get('/uploads/:filename', UploadController.serveFile);
router.delete('/uploads/:filename', authenticateToken, requireAdmin, UploadController.deleteFile);
router.get('/uploads/config', UploadController.getUploadConfig);

export default router;
