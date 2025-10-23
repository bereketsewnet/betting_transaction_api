import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TransactionEvidenceAttributes {
  id: number;
  transactionId: number;
  uploadedByUserId: number;
  fileUrl: string;
  fileType: string;
  createdAt?: Date;
}

export interface TransactionEvidenceCreationAttributes extends Optional<TransactionEvidenceAttributes, 'id' | 'createdAt'> {}

export class TransactionEvidence extends Model<TransactionEvidenceAttributes, TransactionEvidenceCreationAttributes> implements TransactionEvidenceAttributes {
  public id!: number;
  public transactionId!: number;
  public uploadedByUserId!: number;
  public fileUrl!: string;
  public fileType!: string;
  public readonly createdAt!: Date;
}

TransactionEvidence.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'transaction_id',
      references: {
        model: 'transactions',
        key: 'id',
      },
    },
    uploadedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'uploaded_by_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'file_url',
    },
    fileType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'file_type',
    },
  },
  {
    sequelize,
    tableName: 'transaction_evidence',
    timestamps: false,
  }
);
