-- Additive only: difficulty stars, topic and source on papers; evidence text on questions
ALTER TABLE "Paper" ADD COLUMN IF NOT EXISTS "difficulty" INTEGER;
ALTER TABLE "Paper" ADD COLUMN IF NOT EXISTS "topic" TEXT;
ALTER TABLE "Paper" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "evidence" TEXT;
