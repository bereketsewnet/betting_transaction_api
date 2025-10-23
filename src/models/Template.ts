import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface TemplateAttributes {
  id: number;
  languageCode: string;
  keyName: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TemplateCreationAttributes extends Optional<TemplateAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Template extends Model<TemplateAttributes, TemplateCreationAttributes> implements TemplateAttributes {
  public id!: number;
  public languageCode!: string;
  public keyName!: string;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Template.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    languageCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: 'language_code',
      references: {
        model: 'languages',
        key: 'code',
      },
    },
    keyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'key_name',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'templates',
    timestamps: true,
  }
);
