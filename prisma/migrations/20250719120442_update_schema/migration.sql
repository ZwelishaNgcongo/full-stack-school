/*
  Warnings:

  - You are about to drop the column `bloodType` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `bloodType` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the `_SubjectToTeacher` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_A_fkey";

-- DropForeignKey
ALTER TABLE "_SubjectToTeacher" DROP CONSTRAINT "_SubjectToTeacher_B_fkey";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "bloodType",
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "bloodType",
ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "_SubjectToTeacher";

-- CreateTable
CREATE TABLE "_SubjectTeachers" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubjectTeachers_AB_unique" ON "_SubjectTeachers"("A", "B");

-- CreateIndex
CREATE INDEX "_SubjectTeachers_B_index" ON "_SubjectTeachers"("B");

-- AddForeignKey
ALTER TABLE "_SubjectTeachers" ADD CONSTRAINT "_SubjectTeachers_A_fkey" FOREIGN KEY ("A") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectTeachers" ADD CONSTRAINT "_SubjectTeachers_B_fkey" FOREIGN KEY ("B") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- Add this as a Prisma migration or run directly in your database
INSERT INTO "Grade" (level) VALUES 
(0),  -- Grade R
(1),  -- Grade 1
(2),  -- Grade 2
(3),  -- Grade 3
(4),  -- Grade 4
(5),  -- Grade 5
(6),  -- Grade 6
(7),  -- Grade 7
(8),  -- Grade 8
(9),  -- Grade 9
(10), -- Grade 10
(11), -- Grade 11
(12); -- Grade 12