ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "replyToId" INTEGER;
CREATE INDEX IF NOT EXISTS "ChatMessage_replyToId_idx" ON "ChatMessage"("replyToId");
