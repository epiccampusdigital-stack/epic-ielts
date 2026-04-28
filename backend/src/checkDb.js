const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log('Tables:', tables);
    
    const wscols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'WritingSubmission'`;
    console.log('WritingSubmission columns:', wscols);
    
    const rcols = await prisma.$queryRaw`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Result'`;
    console.log('Result columns:', rcols);
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
