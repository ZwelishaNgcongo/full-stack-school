/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "gradeId" INTEGER,
ALTER COLUMN "description" DROP NOT NULL;

-- DropTable
DROP TABLE "Attendance";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
