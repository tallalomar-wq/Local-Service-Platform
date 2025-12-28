import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ReviewAttributes {
  id: number;
  bookingId: number;
  customerId: number;
  providerId: number;
  rating: number;
  comment?: string;
  response?: string;
  responseDate?: Date;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public bookingId!: number;
  public customerId!: number;
  public providerId!: number;
  public rating!: number;
  public comment?: string;
  public response?: string;
  public responseDate?: Date;
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Review.init(
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
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
    },
    response: {
      type: DataTypes.TEXT,
    },
    responseDate: {
      type: DataTypes.DATE,
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
    tableName: 'reviews',
    indexes: [
      {
        fields: ['providerId'],
      },
      {
        fields: ['bookingId'],
        unique: true,
      },
    ],
  }
);

export { Review };
