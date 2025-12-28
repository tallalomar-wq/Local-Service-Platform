import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProviderProfileAttributes {
  id: number;
  userId: number;
  businessName: string;
  bio?: string;
  serviceCategoryId: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  hourlyRate?: number;
  yearsOfExperience?: number;
  certifications?: string;
  insurance?: string;
  availableHours?: string;
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'cancelled';
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  rating?: number;
  totalReviews: number;
  completedBookings: number;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProviderProfileCreationAttributes extends Optional<ProviderProfileAttributes, 'id'> {}

class ProviderProfile extends Model<ProviderProfileAttributes, ProviderProfileCreationAttributes>
  implements ProviderProfileAttributes {
  public id!: number;
  public userId!: number;
  public businessName!: string;
  public bio?: string;
  public serviceCategoryId!: number;
  public address?: string;
  public city?: string;
  public state?: string;
  public zipCode?: string;
  public latitude?: number;
  public longitude?: number;
  public hourlyRate?: number;
  public yearsOfExperience?: number;
  public certifications?: string;
  public insurance?: string;
  public availableHours?: string;
  public subscriptionStatus!: 'active' | 'inactive' | 'trial' | 'cancelled';
  public subscriptionStartDate?: Date;
  public subscriptionEndDate?: Date;
  public rating?: number;
  public totalReviews!: number;
  public completedBookings!: number;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProviderProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    serviceCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_categories',
        key: 'id',
      },
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zipCode: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.FLOAT,
    },
    longitude: {
      type: DataTypes.FLOAT,
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
    },
    certifications: {
      type: DataTypes.TEXT,
    },
    insurance: {
      type: DataTypes.TEXT,
    },
    availableHours: {
      type: DataTypes.TEXT,
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'trial', 'cancelled'),
      allowNull: false,
      defaultValue: 'trial',
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
    },
    rating: {
      type: DataTypes.FLOAT,
    },
    totalReviews: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completedBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    tableName: 'provider_profiles',
    indexes: [
      {
        fields: ['userId'],
        unique: true,
      },
      {
        fields: ['serviceCategoryId'],
      },
      {
        fields: ['city', 'state'],
      },
    ],
  }
);

export { ProviderProfile };
