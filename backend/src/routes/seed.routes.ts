import { Router, Request, Response } from 'express';
import { sequelize } from '../config/database';
import { User, ServiceCategory, ProviderProfile } from '../models';
import SubscriptionPlan from '../models/SubscriptionPlan.model';
import bcrypt from 'bcryptjs';

const router = Router();

// Safe seeding endpoint - adds missing data without wiping existing data
router.post('/initialize', async (_req: Request, res: Response) => {
  try {
    // Sync database WITHOUT forcing reset
    await sequelize.sync({ force: false });
    
    const results: any = {};
    
    // Create subscription plans only if none exist
    const planCount = await SubscriptionPlan.count();
    if (planCount === 0) {
      await SubscriptionPlan.bulkCreate([
        {
          name: 'Free Trial',
          stripePriceId: '',
          price: 0,
          interval: 'month',
          features: [
            '5 service requests per month',
            'Basic profile listing',
            'Email notifications',
            '10% commission on bookings'
          ],
          commissionRate: 10.0,
          maxServiceRequests: 5,
          isActive: true,
          displayOrder: 1,
        },
        {
          name: 'Basic',
          stripePriceId: 'price_1SjO9WLpOtnxFiKYKsR68yuM',
          price: 29.00,
          interval: 'month',
          features: [
            'Unlimited service requests',
            'Featured profile listing',
            'Email & SMS notifications',
            'Priority support',
            '8% commission on bookings'
          ],
          commissionRate: 8.0,
          maxServiceRequests: null,
          isActive: true,
          displayOrder: 2,
        },
        {
          name: 'Pro',
          stripePriceId: 'price_1SjOA1LpOtnxFiKYaBvA0tz6',
          price: 49.00,
          interval: 'month',
          features: [
            'Everything in Basic',
            'Top placement in search',
            'Advanced analytics',
            'Custom branding',
            '5% commission on bookings',
            'Dedicated account manager'
          ],
          commissionRate: 5.0,
          maxServiceRequests: null,
          isActive: true,
          displayOrder: 3,
        },
      ]);
      results.subscriptionPlans = 'Created 3 subscription plans';
    } else {
      results.subscriptionPlans = `Skipped - ${planCount} plans already exist`;
    }
    
    // Create service categories only if none exist
    const categoryCount = await ServiceCategory.count();
    if (categoryCount === 0) {
      await ServiceCategory.bulkCreate([
        { name: 'House Cleaning', description: 'Professional home and office cleaning services', icon: '🧹', isActive: true },
        { name: 'Lawn Care', description: 'Lawn mowing, trimming, and landscaping services', icon: '🌿', isActive: true },
        { name: 'Plumbing', description: 'Residential and commercial plumbing services', icon: '🔧', isActive: true },
        { name: 'Electrical', description: 'Licensed electrical repair and installation', icon: '⚡', isActive: true },
        { name: 'Handyman', description: 'General home repair and maintenance', icon: '🔨', isActive: true },
        { name: 'Pet Grooming', description: 'Professional pet grooming and care', icon: '🐕', isActive: true },
        { name: 'Moving Services', description: 'Residential and commercial moving', icon: '📦', isActive: true },
        { name: 'Painting', description: 'Interior and exterior painting services', icon: '🎨', isActive: true },
      ]);
      results.categories = 'Created 8 service categories';
    } else {
      results.categories = `Skipped - ${categoryCount} categories already exist`;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create customers
    await User.bulkCreate([
      { email: 'john@example.com', password: hashedPassword, firstName: 'John', lastName: 'Doe', phone: '555-0101', role: 'customer', isActive: true },
      { email: 'jane@example.com', password: hashedPassword, firstName: 'Jane', lastName: 'Smith', phone: '555-0102', role: 'customer', isActive: true },
    ]);

    // Create providers
    const providers = await User.bulkCreate([
      { email: 'cleaner@example.com', password: hashedPassword, firstName: 'Maria', lastName: 'Garcia', phone: '555-0201', role: 'provider', isActive: true },
      { email: 'plumber@example.com', password: hashedPassword, firstName: 'Mike', lastName: 'Johnson', phone: '555-0202', role: 'provider', isActive: true },
      { email: 'lawn@example.com', password: hashedPassword, firstName: 'Tom', lastName: 'Green', phone: '555-0203', role: 'provider', isActive: true },
    ]);

    // Create admin
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });

    // Create provider profiles
    await ProviderProfile.bulkCreate([
      {
        userId: providers[0].id,
        businessName: 'Sparkle Clean Services',
        bio: 'Professional cleaning services with 10+ years experience',
        serviceCategoryId: 1,
        address: '123 Main St',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48201',
        hourlyRate: 35,
        yearsOfExperience: 10,
        certifications: 'Licensed & Insured',
        availableHours: 'Mon-Sat 8am-6pm',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        rating: 4.8,
        totalReviews: 45,
        completedBookings: 120,
        isVerified: true,
      },
      {
        userId: providers[1].id,
        businessName: 'Quick Fix Plumbing',
        bio: 'Fast, reliable plumbing services 24/7',
        serviceCategoryId: 3,
        address: '456 Oak Ave',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48202',
        hourlyRate: 85,
        yearsOfExperience: 15,
        certifications: 'Master Plumber License #12345',
        insurance: 'Fully insured',
        availableHours: '24/7 Emergency Service',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        rating: 4.9,
        totalReviews: 78,
        completedBookings: 200,
        isVerified: true,
      },
      {
        userId: providers[2].id,
        businessName: 'Green Lawn Care',
        bio: 'Professional lawn maintenance and landscaping',
        serviceCategoryId: 2,
        address: '789 Elm St',
        city: 'Detroit',
        state: 'MI',
        zipCode: '48203',
        hourlyRate: 45,
        yearsOfExperience: 8,
        certifications: 'Certified Landscaper',
        availableHours: 'Mon-Fri 7am-5pm',
        subscriptionStatus: 'active',
        subscriptionStartDate: new Date(),
        rating: 4.7,
        totalReviews: 32,
        completedBookings: 85,
        isVerified: true,
      },
    ]);

    res.json({ 
      message: 'Database seeding completed!',
      results
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding database', error });
  }
});

export default router;
