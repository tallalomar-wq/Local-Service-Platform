require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Run payment adjustments migration
    const paymentAdjustmentsPath = path.join(__dirname, 'migrations', 'add_payment_adjustments.sql');
    const paymentAdjustmentsSql = fs.readFileSync(paymentAdjustmentsPath, 'utf8');

    console.log('Running payment_adjustments migration...');
    await client.query(paymentAdjustmentsSql);
    console.log('✓ payment_adjustments migration completed');

    // Run notifications migration
    const notificationsPath = path.join(__dirname, 'migrations', 'add_notifications.sql');
    const notificationsSql = fs.readFileSync(notificationsPath, 'utf8');

    console.log('Running notifications migration...');
    await client.query(notificationsSql);
    console.log('✓ notifications migration completed');

    console.log('✓ All migrations completed successfully!');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigration();
