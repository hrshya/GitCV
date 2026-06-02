-- CreateTable
CREATE TABLE "GreenhouseJob" (
    "id" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "companySlug" TEXT NOT NULL,
    "companyName" TEXT,
    "title" TEXT NOT NULL,
    "absoluteUrl" TEXT NOT NULL,
    "location" TEXT,
    "department" TEXT,
    "offices" TEXT,
    "content" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "raw" JSONB,
    "sourceUpdatedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GreenhouseJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GreenhouseJob_companySlug_idx" ON "GreenhouseJob"("companySlug");

-- CreateIndex
CREATE INDEX "GreenhouseJob_active_idx" ON "GreenhouseJob"("active");

-- CreateIndex
CREATE INDEX "GreenhouseJob_title_idx" ON "GreenhouseJob"("title");

-- CreateIndex
CREATE INDEX "GreenhouseJob_lastSeenAt_idx" ON "GreenhouseJob"("lastSeenAt");

-- CreateIndex
CREATE INDEX "GreenhouseJob_companySlug_active_idx" ON "GreenhouseJob"("companySlug", "active");

-- CreateIndex
CREATE UNIQUE INDEX "GreenhouseJob_companySlug_sourceJobId_key" ON "GreenhouseJob"("companySlug", "sourceJobId");
