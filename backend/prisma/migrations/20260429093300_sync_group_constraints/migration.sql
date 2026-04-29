-- Manually created migration to ensure sectionId and passageId are nullable
ALTER TABLE "QuestionGroup" ALTER COLUMN "sectionId" DROP NOT NULL;
ALTER TABLE "QuestionGroup" ALTER COLUMN "passageId" DROP NOT NULL;
