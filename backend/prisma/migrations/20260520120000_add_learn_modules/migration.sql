-- CreateTable
CREATE TABLE "LearnModule" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnLesson" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "estimatedMin" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearnProgress" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearnProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LearnProgress_studentId_lessonId_key" ON "LearnProgress"("studentId", "lessonId");

-- AddForeignKey
ALTER TABLE "LearnLesson" ADD CONSTRAINT "LearnLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "LearnModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnProgress" ADD CONSTRAINT "LearnProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearnProgress" ADD CONSTRAINT "LearnProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "LearnLesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
