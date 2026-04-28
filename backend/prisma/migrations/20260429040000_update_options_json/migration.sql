-- Rename old column to preserve data
ALTER TABLE "Question" RENAME COLUMN "options" TO "options_old";

-- Add new JSONB column
ALTER TABLE "Question" ADD COLUMN "options" JSONB;
