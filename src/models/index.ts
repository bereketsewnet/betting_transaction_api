import { Role } from './Role';
import { User } from './User';
import { PlayerProfile } from './PlayerProfile';
import { DepositBank } from './DepositBank';
import { WithdrawalBank } from './WithdrawalBank';
import { BettingSite } from './BettingSite';
import { TransactionStatus } from './TransactionStatus';
import { Transaction } from './Transaction';
import { TransactionEvidence } from './TransactionEvidence';
import { TransactionComment } from './TransactionComment';
import { AuditLog } from './AuditLog';
import { RefreshToken } from './RefreshToken';
import { Language } from './Language';
import { Template } from './Template';

// Define associations
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

PlayerProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(PlayerProfile, { foreignKey: 'userId', as: 'playerProfiles' });

Transaction.belongsTo(PlayerProfile, { foreignKey: 'playerProfileId', as: 'playerProfile' });
PlayerProfile.hasMany(Transaction, { foreignKey: 'playerProfileId', as: 'transactions' });

Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'userTransactions' });

Transaction.belongsTo(User, { foreignKey: 'assignedAgentId', as: 'assignedAgent' });
User.hasMany(Transaction, { foreignKey: 'assignedAgentId', as: 'assignedTransactions' });

Transaction.belongsTo(TransactionStatus, { foreignKey: 'statusId', as: 'status' });
TransactionStatus.hasMany(Transaction, { foreignKey: 'statusId', as: 'transactions' });

Transaction.belongsTo(DepositBank, { foreignKey: 'depositBankId', as: 'depositBank' });
DepositBank.hasMany(Transaction, { foreignKey: 'depositBankId', as: 'depositTransactions' });

Transaction.belongsTo(WithdrawalBank, { foreignKey: 'withdrawalBankId', as: 'withdrawalBank' });
WithdrawalBank.hasMany(Transaction, { foreignKey: 'withdrawalBankId', as: 'withdrawalTransactions' });

Transaction.belongsTo(BettingSite, { foreignKey: 'bettingSiteId', as: 'bettingSite' });
BettingSite.hasMany(Transaction, { foreignKey: 'bettingSiteId', as: 'transactions' });

TransactionEvidence.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });
Transaction.hasMany(TransactionEvidence, { foreignKey: 'transactionId', as: 'evidence' });

TransactionEvidence.belongsTo(User, { foreignKey: 'uploadedByUserId', as: 'uploadedBy' });
User.hasMany(TransactionEvidence, { foreignKey: 'uploadedByUserId', as: 'uploadedEvidence' });

TransactionComment.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });
Transaction.hasMany(TransactionComment, { foreignKey: 'transactionId', as: 'comments' });

TransactionComment.belongsTo(User, { foreignKey: 'commenterUserId', as: 'commenter' });
User.hasMany(TransactionComment, { foreignKey: 'commenterUserId', as: 'comments' });

AuditLog.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });
User.hasMany(AuditLog, { foreignKey: 'actorUserId', as: 'auditLogs' });

RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });

Template.belongsTo(Language, { foreignKey: 'languageCode', as: 'language' });
Language.hasMany(Template, { foreignKey: 'languageCode', as: 'templates' });

export {
  Role,
  User,
  PlayerProfile,
  DepositBank,
  WithdrawalBank,
  BettingSite,
  TransactionStatus,
  Transaction,
  TransactionEvidence,
  TransactionComment,
  AuditLog,
  RefreshToken,
  Language,
  Template,
};
