import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PaymentAdjustmentAttributes {
  id: number;
  bookingId: number;
  requestedBy: number; // provider userId
  amount: number;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  respondedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PaymentAdjustmentCreationAttributes extends Optional<PaymentAdjustmentAttributes, 'id'> {}

class PaymentAdjustment extends Model<PaymentAdjustmentAttributes, PaymentAdjustmentCreationAttributes> 
  implements PaymentAdjustmentAttributes {
  public id!: number;
  public bookingId!: number;
  public requestedBy!: number;
  public amount!: number;
  public reason!: string;
  public description?: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public respondedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PaymentAdjustment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
    requestedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'payment_adjustments',
    timestamps: true,
  }
);

export default PaymentAdjustment;
