const {PrismaClient} = require('@prisma/client'); 
const p = new PrismaClient(); 
p.paper.findMany().then(r => { 
  console.log('PAPERS:', r.length); 
  r.forEach(paper => console.log(paper.paperCode, paper.status, paper.testType)); 
}).catch(console.error)
  .finally(() => p.$disconnect());
