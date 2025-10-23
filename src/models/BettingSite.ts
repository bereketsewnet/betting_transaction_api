import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BettingSiteAttributes {
  id: number;
  name: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BettingSiteCreationAttributes extends Optional<BettingSiteAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class BettingSite extends Model<BettingSiteAttributes, BettingSiteCreationAttributes> implements BettingSiteAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public website?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public transactions?: any[];
}

BettingSite.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'BettingSite',
    tableName: 'betting_sites',
    timestamps: true,
  }
);

export default BettingSite;
