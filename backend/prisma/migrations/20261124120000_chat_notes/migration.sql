-- Students' own notes: a saved copy of a chat message, or something they typed themselves
CREATE TABLE IF NOT EXISTS "ChatNote" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "messageId" INTEGER,
  "groupId" INTEGER,
  "groupName" TEXT,
  "fromName" TEXT,
  "text" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "myNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ChatNote_userId_id_idx" ON "ChatNote"("userId", "id");
