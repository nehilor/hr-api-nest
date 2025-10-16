-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack" TEXT,
    "fingerprint" TEXT NOT NULL,
    "userId" TEXT,
    "release" TEXT,
    "environment" TEXT,
    "url" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "projects_apiKey_key" ON "projects"("apiKey");

-- CreateIndex
CREATE INDEX "events_projectId_createdAt_idx" ON "events"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "events_projectId_fingerprint_idx" ON "events"("projectId", "fingerprint");

-- CreateIndex
CREATE INDEX "events_fingerprint_idx" ON "events"("fingerprint");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
