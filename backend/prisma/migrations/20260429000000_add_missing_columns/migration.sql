-- Safe migration to add missing columns and enable CASCADE deletes without dropping data.

-- Drop old foreign keys to re-create them with CASCADE
ALTER TABLE "Passage" DROP CONSTRAINT IF EXISTS "Passage_paperId_fkey";
ALTER TABLE "WritingTask" DROP CONSTRAINT IF EXISTS "WritingTask_paperId_fkey";
ALTER TABLE "Question" DROP CONSTRAINT IF EXISTS "Question_paperId_fkey";
ALTER TABLE "Attempt" DROP CONSTRAINT IF EXISTS "Attempt_studentId_fkey";
ALTER TABLE "Attempt" DROP CONSTRAINT IF EXISTS "Attempt_paperId_fkey";
ALTER TABLE "Answer" DROP CONSTRAINT IF EXISTS "Answer_attemptId_fkey";
ALTER TABLE "Answer" DROP CONSTRAINT IF EXISTS "Answer_questionId_fkey";
ALTER TABLE "WritingSubmission" DROP CONSTRAINT IF EXISTS "WritingSubmission_attemptId_fkey";
ALTER TABLE "Result" DROP CONSTRAINT IF EXISTS "Result_attemptId_fkey";
ALTER TABLE "SpeakingSubmission" DROP CONSTRAINT IF EXISTS "SpeakingSubmission_attemptId_fkey";

-- Add missing columns to existing tables
ALTER TABLE "Paper" 
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "practiceMode" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "WritingTask" 
ADD COLUMN IF NOT EXISTS "chartDescription" TEXT,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "tableData" JSONB,
ADD COLUMN IF NOT EXISTS "timeMinutes" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Question" ADD COLUMN IF NOT EXISTS "groupId" INTEGER;
ALTER TABLE "WritingSubmission" ADD COLUMN IF NOT EXISTS "writingTaskId" INTEGER;

-- Create new tables for Listening structure
CREATE TABLE IF NOT EXISTS "Section" (
    "id" SERIAL NOT NULL,
    "paperId" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT,
    "audioUrl" TEXT,
    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuestionGroup" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "groupType" TEXT NOT NULL,
    "instruction" TEXT,
    "imageUrl" TEXT,
    "tableData" JSONB,
    "wordLimit" TEXT,
    CONSTRAINT "QuestionGroup_pkey" PRIMARY KEY ("id")
);

-- Re-add foreign keys with ON DELETE CASCADE
ALTER TABLE "Passage" ADD CONSTRAINT "Passage_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WritingTask" ADD CONSTRAINT "WritingTask_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Section" ADD CONSTRAINT "Section_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionGroup" ADD CONSTRAINT "QuestionGroup_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Question" ADD CONSTRAINT "Question_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "QuestionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "Paper"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WritingSubmission" ADD CONSTRAINT "WritingSubmission_writingTaskId_fkey" FOREIGN KEY ("writingTaskId") REFERENCES "WritingTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Result" ADD CONSTRAINT "Result_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
