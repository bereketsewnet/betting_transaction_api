import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface WithdrawalBankAttributes {
  id: number;
  bankName: string;
  requiredFields: any; // JSON field
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WithdrawalBankCreationAttributes extends Optional<WithdrawalBankAttributes, 'id' | 'notes' | 'isActive' | 'createdAt' | 'updatedAt'> {}

export class WithdrawalBank extends Model<WithdrawalBankAttributes, WithdrawalBankCreationAttributes> implements WithdrawalBankAttributes {
  public id!: number;
  public bankName!: string;
  public requiredFields!: any;
  public notes?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

WithdrawalBank.init(
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
    requiredFields: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'required_fields',
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
    tableName: 'withdrawal_banks',
    timestamps: true,
  }
);
