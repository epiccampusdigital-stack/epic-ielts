-- Additive only: the course a student chose at sign up (IELTS | GENERAL). Safe to run again.
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "course" TEXT;
