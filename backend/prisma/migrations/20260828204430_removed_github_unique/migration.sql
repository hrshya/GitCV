-- DropIndex
DROP INDEX "User_githubUsername_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "clerkUserId" DROP NOT NULL;
