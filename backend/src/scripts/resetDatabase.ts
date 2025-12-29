import { sequelize } from '../config/database';
import { ServiceCategory, SubscriptionPlan } from '../models';

const resetDatabase = async () => {
  try {
    console.log('⚠️  WARNING: This will DELETE ALL DATA in the database!');
    console.log('Connecting to database...');
    
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Drop all tables and recreate with proper schema
    console.log('🗑️  Dropping all tables...');
    await sequelize.sync({ force: true });
    console.log('✅ All tables dropped and recreated with current schema\n');

    // Seed subscription plans
    console.log('💳 Creating subscription plans...');
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
    console.log('✅ Created 3 subscription plans\n');

    // Seed service categories
    console.log('🔧 Creating service categories...');
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
    console.log('✅ Created 8 service categories\n');

    console.log('🎉 Database reset complete!');
    console.log('\n📝 Summary:');
    console.log('   - All old data deleted');
    console.log('   - Schema updated to latest version');
    console.log('   - 3 subscription plans created');
    console.log('   - 8 service categories created');
    console.log('   - Users table empty (register through UI)');
    console.log('\n✨ Ready for fresh registrations!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetDatabase();
