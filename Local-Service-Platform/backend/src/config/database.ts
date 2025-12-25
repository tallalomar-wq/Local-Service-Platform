import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'sqlite:./local_service.db';
const isProduction = process.env.NODE_ENV === 'production';

export const sequelize = new Sequelize(databaseUrl, {
  logging: isProduction ? false : console.log,
  define: {
    timestamps: true,
  },
  dialectOptions: isProduction && databaseUrl.startsWith('postgres') ? {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  } : {},
});

export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
