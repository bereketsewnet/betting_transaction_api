import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface AuditLogAttributes {
  id: number;
  actorUserId: number;
  entity: string;
  entityId: number;
  action: string;
  oldValue?: any; // JSON field
  newValue?: any; // JSON field
  ipAddress?: string;
  createdAt?: Date;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'oldValue' | 'newValue' | 'ipAddress' | 'createdAt'> {}

export class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: number;
  public actorUserId!: number;
  public entity!: string;
  public entityId!: number;
  public action!: string;
  public oldValue?: any;
  public newValue?: any;
  public ipAddress?: string;
  public readonly createdAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    actorUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'actor_user_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    entity: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'entity_id',
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    oldValue: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'old_value',
    },
    newValue: {
      type: DataTypes.JSON,
      allowNull: true,
      field: 'new_value',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
  }
);
