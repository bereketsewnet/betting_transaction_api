import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TransactionCommentAttributes {
  id: number;
  transactionId: number;
  commenterUserId: number;
  rating?: number;
  comment: string;
  createdAt?: Date;
}

export interface TransactionCommentCreationAttributes extends Optional<TransactionCommentAttributes, 'id' | 'rating' | 'createdAt'> {}

export class TransactionComment extends Model<TransactionCommentAttributes, TransactionCommentCreationAttributes> implements TransactionCommentAttributes {
  public id!: number;
  public transactionId!: number;
  public commenterUserId!: number;
  public rating?: number;
  public comment!: string;
  public readonly createdAt!: Date;
}

TransactionComment.init(
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
    commenterUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'commenter_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'transaction_comments',
    timestamps: false,
  }
);
