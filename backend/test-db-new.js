const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.$connect()
  .then(() => {
    console.log('DB CONNECTED OK');
    p.$disconnect();
    process.exit(0);
  })
  .catch(e => {
    console.error('DB FAILED:', e.message);
    process.exit(1);
  });
