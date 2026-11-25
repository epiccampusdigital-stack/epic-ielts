-- A question set in a chat message: questions, accepted answers and the earlier messages (photo, audio, PDF) it uses
ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "quiz" JSONB;
