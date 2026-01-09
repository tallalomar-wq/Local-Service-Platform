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

    const sqlPath = path.join(__dirname, 'migrations', 'add_payment_adjustments.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running migration...');
    await client.query(sql);
    console.log('✓ Migration completed successfully!');
    console.log('✓ payment_adjustments table created');

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

runMigration();
