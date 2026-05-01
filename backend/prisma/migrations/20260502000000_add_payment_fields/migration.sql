-- Add payment fields to Student table
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "isPaid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "stripeSessionId" TEXT;
