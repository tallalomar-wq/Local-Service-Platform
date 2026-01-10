import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface NotificationAttributes {
  id: number;
  userId: number;
  type: 'booking' | 'payment' | 'review' | 'subscription' | 'general';
  title: string;
  message: string;
  relatedId?: number; // booking ID, payment adjustment ID, etc.
  relatedType?: string; // 'booking', 'payment_adjustment', 'review'
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id'> {}

class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> 
  implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'booking' | 'payment' | 'review' | 'subscription' | 'general';
  public title!: string;
  public message!: string;
  public relatedId?: number;
  public relatedType?: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
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
    type: {
      type: DataTypes.ENUM('booking', 'payment', 'review', 'subscription', 'general'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    relatedType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_read',
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'isRead'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

export default Notification;
