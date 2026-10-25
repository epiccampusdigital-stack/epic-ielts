-- Additive only. Safe to run on production: no drops, no data changes to existing rows.

-- Track columns (existing rows default to IELTS)
ALTER TABLE "Paper" ADD COLUMN IF NOT EXISTS "track" TEXT NOT NULL DEFAULT 'IELTS';
ALTER TABLE "LearnModule" ADD COLUMN IF NOT EXISTS "track" TEXT NOT NULL DEFAULT 'IELTS';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Program" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "totalDays" INTEGER NOT NULL DEFAULT 30,
    "dayStartTime" TEXT NOT NULL DEFAULT '08:30',
    "dayEndTime" TEXT NOT NULL DEFAULT '20:30',
    "koreanSiteUrl" TEXT,
    "adminPhone" TEXT,
    "remindMinutes" INTEGER NOT NULL DEFAULT 30,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramTeacher" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "subject" TEXT NOT NULL DEFAULT 'ENGLISH',
    "focus" TEXT,
    "confirmed" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "accountId" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramTeacher_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramDay" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "theme" TEXT,
    "englishFocus" TEXT,
    "koreanFocus" TEXT,
    "itLabTask" TEXT,
    "notes" TEXT,
    CONSTRAINT "ProgramDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramSession" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "language" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "teacherId" INTEGER,
    "room" TEXT,
    "link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramStudent" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "scholarship" TEXT,
    "studentId" INTEGER,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramStudent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramAttendance" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "programStudentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProgramAttendance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramReminder" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "teacherId" INTEGER,
    "sessionId" INTEGER,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "channel" TEXT,
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "dedupeKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramReminder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProgramChangeLog" (
    "id" SERIAL NOT NULL,
    "programId" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "actor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProgramChangeLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramDay_programId_dayNumber_key" ON "ProgramDay"("programId", "dayNumber");
CREATE INDEX IF NOT EXISTS "ProgramSession_programId_dayNumber_idx" ON "ProgramSession"("programId", "dayNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramAttendance_sessionId_programStudentId_key" ON "ProgramAttendance"("sessionId", "programStudentId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramReminder_dedupeKey_key" ON "ProgramReminder"("dedupeKey");
CREATE INDEX IF NOT EXISTS "ProgramReminder_programId_status_dueAt_idx" ON "ProgramReminder"("programId", "status", "dueAt");

-- Foreign keys
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramSession" ADD CONSTRAINT "ProgramSession_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramSession" ADD CONSTRAINT "ProgramSession_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "ProgramTeacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgramStudent" ADD CONSTRAINT "ProgramStudent_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramAttendance" ADD CONSTRAINT "ProgramAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProgramSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramAttendance" ADD CONSTRAINT "ProgramAttendance_programStudentId_fkey" FOREIGN KEY ("programStudentId") REFERENCES "ProgramStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramReminder" ADD CONSTRAINT "ProgramReminder_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramReminder" ADD CONSTRAINT "ProgramReminder_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "ProgramTeacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramReminder" ADD CONSTRAINT "ProgramReminder_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ProgramSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgramChangeLog" ADD CONSTRAINT "ProgramChangeLog_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
