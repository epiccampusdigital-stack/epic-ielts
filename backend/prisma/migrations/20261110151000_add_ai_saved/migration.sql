CREATE TABLE IF NOT EXISTS "AiSaved" (
  "id" SERIAL NOT NULL,
  "studentId" INTEGER NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiSaved_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "AiSaved_studentId_idx" ON "AiSaved"("studentId");
