const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './local_service.db',
  logging: false
});

(async () => {
  // Update Green Lawn Care (userId: 5, id: 3) with Basic plan (id: 2)
  await sequelize.query(`
    UPDATE provider_profiles 
    SET subscriptionPlanId = 2
    WHERE userId = 5
  `);
  
  console.log('Updated Green Lawn Care profile with Basic plan!');
  
  // Verify
  const [result] = await sequelize.query(`
    SELECT p.id, p.businessName, p.subscriptionPlanId, p.subscriptionStatus, s.name as planName, s.price
    FROM provider_profiles p
    LEFT JOIN subscription_plans s ON p.subscriptionPlanId = s.id
    WHERE p.userId = 5
  `);
  
  console.log('\nUpdated profile:', result[0]);
  process.exit(0);
})();
