import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface DepositBankAttributes {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepositBankCreationAttributes extends Optional<DepositBankAttributes, 'id' | 'notes' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class DepositBank extends Model<DepositBankAttributes, DepositBankCreationAttributes> implements DepositBankAttributes {
  public id!: number;
  public bankName!: string;
  public accountNumber!: string;
  public accountName!: string;
  public notes?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DepositBank.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bankName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'bank_name',
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'account_number',
    },
    accountName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'account_name',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    sequelize,
    tableName: 'deposit_banks',
    timestamps: true,
  }
);
