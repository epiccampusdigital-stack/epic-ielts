-- Add email verification fields to Student
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT;
