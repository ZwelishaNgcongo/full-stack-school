/*
  Warnings:

  - You are about to drop the column `classId` on the `Event` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_classId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "classId";
