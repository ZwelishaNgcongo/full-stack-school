/*
  Warnings:

  - You are about to drop the column `lessonId` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_lessonId_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "lessonId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ExamLesson" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,

    CONSTRAINT "ExamLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExamLesson_examId_idx" ON "ExamLesson"("examId");

-- CreateIndex
CREATE INDEX "ExamLesson_lessonId_idx" ON "ExamLesson"("lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "ExamLesson_examId_lessonId_key" ON "ExamLesson"("examId", "lessonId");

-- AddForeignKey
ALTER TABLE "ExamLesson" ADD CONSTRAINT "ExamLesson_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamLesson" ADD CONSTRAINT "ExamLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
