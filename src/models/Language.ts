import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface LanguageAttributes {
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LanguageCreationAttributes extends Optional<LanguageAttributes, 'isActive' | 'createdAt' | 'updatedAt'> {}

export class Language extends Model<LanguageAttributes, LanguageCreationAttributes> implements LanguageAttributes {
  public code!: string;
  public name!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Language.init(
  {
    code: {
      type: DataTypes.STRING(5),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
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
    tableName: 'languages',
    timestamps: true,
  }
);
