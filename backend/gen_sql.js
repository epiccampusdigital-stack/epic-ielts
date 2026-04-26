require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const paper = {
    paperCode: '003',
    testType: 'READING',
    title: 'Academic Reading Test — Anthropocene, Behavioural Economics, AI Ethics',
    timeLimitMin: 60,
    instructions: 'Read the passages carefully and answer Questions 1-40.',
    status: 'ACTIVE',
    assignedBatches: 'ALL'
  };

  console.log(`INSERT INTO "Paper" ("paperCode", "testType", "title", "timeLimitMin", "instructions", "status", "assignedBatches") VALUES ('${paper.paperCode}', '${paper.testType}', '${paper.title}', ${paper.timeLimitMin}, '${paper.instructions}', '${paper.status}', '${paper.assignedBatches}') RETURNING id;`);

  // I'll just generate the whole script to be safe.
}
main();
