const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to database');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to database', err.message);
    process.exit(1);
  });
