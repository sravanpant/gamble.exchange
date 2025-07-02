/*
  Warnings:

  - Made the column `userId` on table `MinesGame` required. This step will fail if there are existing NULL values in that column.
  - Made the column `betAmount` on table `MinesGame` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "MinesGame" DROP CONSTRAINT "MinesGame_userId_fkey";

-- DropIndex
DROP INDEX "MinesGame_userId_idx";

-- AlterTable
ALTER TABLE "MinesGame" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "betAmount" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "MinesGame" ADD CONSTRAINT "MinesGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
