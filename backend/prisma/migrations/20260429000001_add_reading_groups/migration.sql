-- Add passageId to QuestionGroup to support grouping questions in Reading passages.
ALTER TABLE "QuestionGroup" ALTER COLUMN "sectionId" DROP NOT NULL;
ALTER TABLE "QuestionGroup" ADD COLUMN "passageId" INTEGER;
ALTER TABLE "QuestionGroup" ADD CONSTRAINT "QuestionGroup_passageId_fkey" FOREIGN KEY ("passageId") REFERENCES "Passage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
