import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BookingAttributes {
  id: number;
  customerId: number;
  providerId: number;
  serviceCategoryId: number;
  serviceDate: Date;
  serviceTime: string;
  duration?: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description?: string;
  estimatedCost?: number;
  finalCost?: number;
  commission?: number;
  status: 'pending' | 'accepted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  cancellationReason?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public customerId!: number;
  public providerId!: number;
  public serviceCategoryId!: number;
  public serviceDate!: Date;
  public serviceTime!: string;
  public duration?: number;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public description?: string;
  public estimatedCost?: number;
  public finalCost?: number;
  public commission?: number;
  public status!: 'pending' | 'accepted' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  public cancellationReason?: string;
  public paymentStatus!: 'pending' | 'paid' | 'refunded';
  public paymentMethod?: string;
  public transactionId?: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'provider_profiles',
        key: 'id',
      },
    },
    serviceCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'service_categories',
        key: 'id',
      },
    },
    serviceDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    serviceTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(10, 2),
    },
    finalCost: {
      type: DataTypes.DECIMAL(10, 2),
    },
    commission: {
      type: DataTypes.DECIMAL(10, 2),
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'confirmed', 'in-progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    cancellationReason: {
      type: DataTypes.TEXT,
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    paymentMethod: {
      type: DataTypes.STRING,
    },
    transactionId: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'bookings',
    indexes: [
      {
        fields: ['customerId'],
      },
      {
        fields: ['providerId'],
      },
      {
        fields: ['serviceDate'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export { Booking };
