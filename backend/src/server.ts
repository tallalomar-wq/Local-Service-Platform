import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './config/database';
import authRoutes from './routes/auth.routes';
import providerRoutes from './routes/provider.routes';
import bookingRoutes from './routes/booking.routes';
import serviceRoutes from './routes/service.routes';
import reviewRoutes from './routes/review.routes';
import seedRoutes from './routes/seed.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { errorHandler } from './middleware/error.middleware';
import { User } from './models';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/seed', seedRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    await sequelize.sync({ force: false });
    console.log('Database models synchronized.');
    
    // Auto-seed database if empty (production first-time deploy)
    const userCount = await User.count();
    if (userCount === 0 && process.env.NODE_ENV === 'production') {
      console.log('Database is empty. Running seed script...');
      try {
        const { exec } = require('child_process');
        exec('npm run seed', (error: any, stdout: any, stderr: any) => {
          if (error) {
            console.error('Seed script error:', error);
          } else {
            console.log('Seed script output:', stdout);
          }
        });
      } catch (seedError) {
        console.error('Failed to run seed script:', seedError);
      }
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export default app;
