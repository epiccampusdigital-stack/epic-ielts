-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Paper" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "paperCode" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "timeLimitMin" INTEGER NOT NULL,
    "instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "assignedBatches" TEXT NOT NULL DEFAULT 'ALL'
);
INSERT INTO "new_Paper" ("id", "instructions", "paperCode", "status", "testType", "timeLimitMin", "title") SELECT "id", "instructions", "paperCode", "status", "testType", "timeLimitMin", "title" FROM "Paper";
DROP TABLE "Paper";
ALTER TABLE "new_Paper" RENAME TO "Paper";
CREATE UNIQUE INDEX "Paper_paperCode_key" ON "Paper"("paperCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
