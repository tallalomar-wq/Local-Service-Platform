import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface SubscriptionPlanAttributes {
  id?: number;
  name: string;
  stripePriceId: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  commissionRate: number;
  maxServiceRequests: number;
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class SubscriptionPlan extends Model<SubscriptionPlanAttributes> implements SubscriptionPlanAttributes {
  public id!: number;
  public name!: string;
  public stripePriceId!: string;
  public price!: number;
  public interval!: 'month' | 'year';
  public features!: string[];
  public commissionRate!: number;
  public maxServiceRequests!: number;
  public isActive!: boolean;
  public displayOrder!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SubscriptionPlan.init(
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
    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'stripe_price_id',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    interval: {
      type: DataTypes.ENUM('month', 'year'),
      allowNull: false,
      defaultValue: 'month',
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.0,
      field: 'commission_rate',
      comment: 'Commission percentage (e.g., 10.0 for 10%)',
    },
    maxServiceRequests: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'max_service_requests',
      comment: 'Max requests per month, NULL for unlimited',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'display_order',
    },
  },
  {
    sequelize,
    tableName: 'subscription_plans',
    timestamps: true,
  }
);

export default SubscriptionPlan;
