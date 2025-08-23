/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_parentId_fkey";

-- DropIndex
DROP INDEX "Parent_phone_key";

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "studentId" TEXT NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "parentId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
