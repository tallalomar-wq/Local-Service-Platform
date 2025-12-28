import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ServiceCategoryAttributes {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceCategoryCreationAttributes extends Optional<ServiceCategoryAttributes, 'id'> {}

class ServiceCategory extends Model<ServiceCategoryAttributes, ServiceCategoryCreationAttributes>
  implements ServiceCategoryAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public icon?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ServiceCategory.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    icon: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'service_categories',
  }
);

export { ServiceCategory };
