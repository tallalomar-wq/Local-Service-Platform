import { sequelize } from '../config/database';
import { User, ServiceCategory, ProviderProfile, SubscriptionPlan } from '../models';

const checkDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Check Users
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    console.log('👥 USERS:', users.length);
    console.log('Customers:', users.filter(u => u.role === 'customer').length);
    console.log('Providers:', users.filter(u => u.role === 'provider').length);
    console.log('Admins:', users.filter(u => u.role === 'admin').length);
    if (users.length > 0) {
      console.log('\nUser Details:');
      users.forEach(u => {
        console.log(`  - ${u.email} (${u.firstName} ${u.lastName}) - ${u.role} - ID: ${u.id}`);
      });
    }

    // Check Provider Profiles
    console.log('\n📋 PROVIDER PROFILES:', await ProviderProfile.count());
    const profiles = await ProviderProfile.findAll({
      include: [{ model: User, as: 'user', attributes: ['email', 'firstName', 'lastName'] }],
    });
    if (profiles.length > 0) {
      console.log('Profile Details:');
      profiles.forEach((p: any) => {
        console.log(`  - ${p.businessName} (User: ${p.user?.email})`);
      });
    }

    // Check Service Categories
    console.log('\n🔧 SERVICE CATEGORIES:', await ServiceCategory.count());
    const categories = await ServiceCategory.findAll({ attributes: ['id', 'name', 'icon'] });
    if (categories.length > 0) {
      categories.forEach(c => console.log(`  - ${c.icon} ${c.name} (ID: ${c.id})`));
    }

    // Check Subscription Plans
    console.log('\n💳 SUBSCRIPTION PLANS:', await SubscriptionPlan.count());
    const plans = await SubscriptionPlan.findAll({ attributes: ['id', 'name', 'price'] });
    if (plans.length > 0) {
      plans.forEach(p => console.log(`  - ${p.name} - $${p.price}/month (ID: ${p.id})`));
    }

    console.log('\n✅ Database check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDatabase();
