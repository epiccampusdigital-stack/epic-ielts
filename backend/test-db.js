require('dotenv').config();
console.log('API KEY:', process.env.ANTHROPIC_API_KEY ? 'EXISTS - ' + process.env.ANTHROPIC_API_KEY.substring(0,20) : 'MISSING');
const {PrismaClient}=require('@prisma/client');
const p=new PrismaClient();
p.$connect()
  .then(()=>{ console.log('DB CONNECTED'); return p.paper.count(); })
  .then(c=>{ console.log('Papers in DB:', c); p.$disconnect(); })
  .catch(e=>{ console.error('DB FAILED:', e.message); });
