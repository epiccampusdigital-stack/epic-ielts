-- Writing papers with more than three tasks: every answer, keyed by task number
ALTER TABLE "WritingSubmission" ADD COLUMN IF NOT EXISTS "responses" JSONB;
