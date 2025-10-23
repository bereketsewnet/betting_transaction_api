import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TransactionStatusAttributes {
  id: number;
  code: string;
  label: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionStatusCreationAttributes extends Optional<TransactionStatusAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class TransactionStatus extends Model<TransactionStatusAttributes, TransactionStatusCreationAttributes> implements TransactionStatusAttributes {
  public id!: number;
  public code!: string;
  public label!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TransactionStatus.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transaction_statuses',
    timestamps: true,
  }
);
