/*
  Warnings:

  - You are about to drop the column `description` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "description",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "department" JSONB,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "offices" JSONB;
