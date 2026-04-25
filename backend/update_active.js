const {PrismaClient} = require('@prisma/client'); 
const p = new PrismaClient(); 
p.paper.updateMany({ data: { status: 'ACTIVE' } })
  .then(r => console.log('Updated:', r))
  .catch(console.error)
  .finally(() => p.$disconnect());
