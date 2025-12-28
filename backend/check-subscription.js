const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './local_service.db',
  logging: false
});

const ProviderProfile = sequelize.define('provider_profiles', {
  id: { type: Sequelize.INTEGER, primaryKey: true },
  userId: { type: Sequelize.INTEGER, field: 'userId' },
  businessName: { type: Sequelize.STRING, field: 'businessName' },
  stripeCustomerId: { type: Sequelize.STRING, field: 'stripe_customer_id' },
  stripeSubscriptionId: { type: Sequelize.STRING, field: 'stripe_subscription_id' },
  subscriptionPlanId: { type: Sequelize.INTEGER, field: 'subscriptionPlanId' },
  subscriptionStatus: { type: Sequelize.STRING, field: 'subscriptionStatus' }
}, { timestamps: false });

(async () => {
  const profiles = await ProviderProfile.findAll();
  console.log('\nProvider Profiles:');
  profiles.forEach(p => {
    console.log(`\nID: ${p.id}, Business: ${p.businessName}`);
    console.log(`  User ID: ${p.userId}`);
    console.log(`  Stripe Customer: ${p.stripeCustomerId || 'None'}`);
    console.log(`  Stripe Subscription: ${p.stripeSubscriptionId || 'None'}`);
    console.log(`  Plan ID: ${p.subscriptionPlanId || 'None'}`);
    console.log(`  Status: ${p.subscriptionStatus}`);
  });
  process.exit(0);
})();
