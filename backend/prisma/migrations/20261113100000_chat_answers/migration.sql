ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "highlights" JSONB;
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3);
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "askAnswer" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "pinned" BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS "ChatAnswer" (
  "id" SERIAL NOT NULL,
  "messageId" INTEGER NOT NULL,
  "studentId" INTEGER NOT NULL,
  "text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SENT',
  "score" INTEGER,
  "feedback" TEXT,
  "checkedBy" TEXT,
  "checkedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatAnswer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ChatAnswer_messageId_studentId_key" ON "ChatAnswer"("messageId", "studentId");
CREATE INDEX IF NOT EXISTS "ChatAnswer_studentId_checkedAt_idx" ON "ChatAnswer"("studentId", "checkedAt");
CREATE INDEX IF NOT EXISTS "ChatMessage_groupId_editedAt_idx" ON "ChatMessage"("groupId", "editedAt");
