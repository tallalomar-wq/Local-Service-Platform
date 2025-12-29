import { sequelize } from '../config/database';
import { User, ProviderProfile, ServiceCategory } from '../models';

const checkProviders = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected\n');

    // Get all providers
    const providerUsers = await User.findAll({
      where: { role: 'provider' },
      attributes: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    console.log(`👥 PROVIDER USERS: ${providerUsers.length}`);
    if (providerUsers.length > 0) {
      providerUsers.forEach(u => {
        console.log(`  - ID ${u.id}: ${u.email} (${u.firstName} ${u.lastName})`);
      });
    }

    // Get all provider profiles
    const profiles = await ProviderProfile.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
        {
          model: ServiceCategory,
          as: 'serviceCategory',
          attributes: ['name', 'icon'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    console.log(`\n📋 PROVIDER PROFILES: ${profiles.length}`);
    if (profiles.length > 0) {
      profiles.forEach((p: any) => {
        console.log(`\n  Profile ID: ${p.id}`);
        console.log(`  Business: ${p.businessName}`);
        console.log(`  User: ${p.user?.email} (ID: ${p.userId})`);
        console.log(`  Category: ${p.serviceCategory?.icon} ${p.serviceCategory?.name}`);
        console.log(`  City: ${p.city}, ${p.state}`);
        console.log(`  Hourly Rate: $${p.hourlyRate}`);
        console.log(`  Status: ${p.subscriptionStatus}`);
      });
    }

    console.log('\n✅ Check complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProviders();
