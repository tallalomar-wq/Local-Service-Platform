require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, { 
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

sequelize.query('SELECT * FROM subscription_plans', { 
  type: Sequelize.QueryTypes.SELECT 
})
.then(res => {
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
