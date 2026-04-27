require('dotenv').config();
const { Client } = require('pg');

async function migrate() {
  const client = new Client({
    host: '3.227.221.118',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_3sFtxXWCP4rQ',
    database: 'neondb',
    ssl: {
      rejectUnauthorized: false,
      servername: 'ep-cool-smoke-anfxpjy7-pooler.c-6.us-east-1.aws.neon.tech'
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      DO $$ 
      BEGIN 
        -- Rename columns if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SpeakingSubmission' AND column_name = 'part1Audio') THEN
          ALTER TABLE "SpeakingSubmission" RENAME COLUMN "part1Audio" TO "part1AudioUrl";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SpeakingSubmission' AND column_name = 'part2Audio') THEN
          ALTER TABLE "SpeakingSubmission" RENAME COLUMN "part2Audio" TO "part2AudioUrl";
        END IF;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SpeakingSubmission' AND column_name = 'part3Audio') THEN
          ALTER TABLE "SpeakingSubmission" RENAME COLUMN "part3Audio" TO "part3AudioUrl";
        END IF;
        
        -- Add createdAt if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'SpeakingSubmission' AND column_name = 'createdAt') THEN
          ALTER TABLE "SpeakingSubmission" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `;

    await client.query(sql);
    console.log('Manual migration (Step 3) successful!');

  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
