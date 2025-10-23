import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PlayerProfileAttributes {
  id: number;
  userId?: number;
  telegramId?: string;
  telegramUsername?: string;
  playerUuid: string;
  languageCode: string;
  lastActive?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PlayerProfileCreationAttributes extends Optional<PlayerProfileAttributes, 'id' | 'userId' | 'telegramId' | 'telegramUsername' | 'lastActive' | 'createdAt' | 'updatedAt'> {}

export class PlayerProfile extends Model<PlayerProfileAttributes, PlayerProfileCreationAttributes> implements PlayerProfileAttributes {
  public id!: number;
  public userId?: number;
  public telegramId?: string;
  public telegramUsername?: string;
  public playerUuid!: string;
  public languageCode!: string;
  public lastActive?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public user?: any;
  public transactions?: any[];
}

PlayerProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    telegramId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'telegram_id',
    },
    telegramUsername: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'telegram_username',
    },
    playerUuid: {
      type: DataTypes.STRING(36),
      allowNull: false,
      unique: true,
      field: 'player_uuid',
    },
    languageCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: 'en',
      field: 'language_code',
    },
    lastActive: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_active',
    },
  },
  {
    sequelize,
    tableName: 'player_profiles',
    timestamps: true,
  }
);
