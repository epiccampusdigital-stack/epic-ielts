CREATE TABLE IF NOT EXISTS "ChatGroup" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "joinCode" TEXT NOT NULL,
  "onlyStaffPost" BOOLEAN NOT NULL DEFAULT false,
  "archived" BOOLEAN NOT NULL DEFAULT false,
  "createdById" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatGroup_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "ChatGroup_joinCode_key" ON "ChatGroup"("joinCode");
CREATE TABLE IF NOT EXISTS "ChatMember" (
  "id" SERIAL NOT NULL,
  "groupId" INTEGER NOT NULL,
  "studentId" INTEGER NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChatMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ChatGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "ChatMember_groupId_studentId_key" ON "ChatMember"("groupId", "studentId");
CREATE INDEX IF NOT EXISTS "ChatMember_studentId_idx" ON "ChatMember"("studentId");
CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" SERIAL NOT NULL,
  "groupId" INTEGER NOT NULL,
  "senderId" INTEGER NOT NULL,
  "senderName" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'TEXT',
  "text" TEXT NOT NULL,
  "paperId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChatMessage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "ChatGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "ChatMessage_groupId_id_idx" ON "ChatMessage"("groupId", "id");
