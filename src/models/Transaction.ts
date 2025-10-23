import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TransactionAttributes {
  id: number;
  transactionUuid: string;
  playerProfileId: number;
  userId?: number;
  type: 'DEPOSIT' | 'WITHDRAW';
  amount: number;
  currency: string;
  depositBankId?: number;
  withdrawalBankId?: number;
  withdrawalAddress?: string;
  screenshotUrl?: string;
  bettingSiteId?: number;
  playerSiteId?: string;
  requestedAt: Date;
  assignedAgentId?: number;
  statusId: number;
  adminNotes?: string;
  agentNotes?: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionCreationAttributes extends Optional<TransactionAttributes, 'id' | 'userId' | 'depositBankId' | 'withdrawalBankId' | 'withdrawalAddress' | 'screenshotUrl' | 'bettingSiteId' | 'playerSiteId' | 'assignedAgentId' | 'adminNotes' | 'agentNotes' | 'rating' | 'createdAt' | 'updatedAt'> {}

export class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public transactionUuid!: string;
  public playerProfileId!: number;
  public userId?: number;
  public type!: 'DEPOSIT' | 'WITHDRAW';
  public amount!: number;
  public currency!: string;
  public depositBankId?: number;
  public withdrawalBankId?: number;
  public withdrawalAddress?: string;
  public screenshotUrl?: string;
  public bettingSiteId?: number;
  public playerSiteId?: string;
  public requestedAt!: Date;
  public assignedAgentId?: number;
  public statusId!: number;
  public adminNotes?: string;
  public agentNotes?: string;
  public rating?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public playerProfile?: any;
  public status?: any;
  public depositBank?: any;
  public withdrawalBank?: any;
  public bettingSite?: any;
  public assignedAgent?: any;
  public user?: any;
  public evidence?: any[];
  public comments?: any[];
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionUuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
      field: 'transaction_uuid',
    },
    playerProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'player_profile_id',
      references: {
        model: 'player_profiles',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('DEPOSIT', 'WITHDRAW'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD',
    },
    depositBankId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'deposit_bank_id',
      references: {
        model: 'deposit_banks',
        key: 'id',
      },
    },
    withdrawalBankId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'withdrawal_bank_id',
      references: {
        model: 'withdrawal_banks',
        key: 'id',
      },
    },
    withdrawalAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'withdrawal_address',
    },
    screenshotUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'screenshot_url',
    },
    bettingSiteId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'betting_site_id',
      references: {
        model: 'betting_sites',
        key: 'id',
      },
    },
    playerSiteId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'player_site_id',
    },
    requestedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'requested_at',
    },
    assignedAgentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'assigned_agent_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'status_id',
      references: {
        model: 'transaction_statuses',
        key: 'id',
      },
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'admin_notes',
    },
    agentNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'agent_notes',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    sequelize,
    tableName: 'transactions',
    timestamps: true,
  }
);
