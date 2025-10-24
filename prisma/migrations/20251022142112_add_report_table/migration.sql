/*
  Warnings:

  - A unique constraint covering the columns `[examId,studentId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assignmentId,studentId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Term" AS ENUM ('TERM1', 'TERM2', 'TERM3', 'TERM4');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileUrl" TEXT;

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "term" "Term" NOT NULL,
    "year" INTEGER NOT NULL,
    "marks" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "teacherComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Report_studentId_idx" ON "Report"("studentId");

-- CreateIndex
CREATE INDEX "Report_term_idx" ON "Report"("term");

-- CreateIndex
CREATE INDEX "Report_year_idx" ON "Report"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Report_studentId_subjectId_term_year_key" ON "Report"("studentId", "subjectId", "term", "year");

-- CreateIndex
CREATE INDEX "Result_studentId_idx" ON "Result"("studentId");

-- CreateIndex
CREATE INDEX "Result_examId_idx" ON "Result"("examId");

-- CreateIndex
CREATE INDEX "Result_assignmentId_idx" ON "Result"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_examId_studentId_key" ON "Result"("examId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Result_assignmentId_studentId_key" ON "Result"("assignmentId", "studentId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
