CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProjectRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."HierarchyLevel" AS ENUM ('LONG_TERM_IMPACT', 'MID_TERM_IMPACT', 'SHORT_TERM_IMPACT', 'OUTPUT', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "public"."InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "isSiteAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "public"."ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectMember" (
    "id" TEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedByUserId" TEXT,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactRow" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "hierarchyLevel" "public"."HierarchyLevel" NOT NULL,
    "resultStatement" TEXT NOT NULL,
    "indicator" TEXT,
    "indicatorDefinition" TEXT,
    "meansOfMeasurement" TEXT,
    "baseline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT,
    "updatedByUserId" TEXT,

    CONSTRAINT "ImpactRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactRowTarget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "impactRowId" TEXT NOT NULL,
    "sdgTargetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImpactRowTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatrixEntry" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceSdgTargetId" TEXT NOT NULL,
    "targetSdgTargetId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "rationale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatrixEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SDG" (
    "id" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "colorHex" TEXT,

    CONSTRAINT "SDG_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SDGTarget" (
    "id" TEXT NOT NULL,
    "sdgId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT,

    CONSTRAINT "SDGTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectInvite" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "role" "public"."ProjectRole" NOT NULL,
    "token" TEXT NOT NULL,
    "status" "public"."InviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedByUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "public"."ProjectMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "public"."ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ImpactRow_projectId_idx" ON "public"."ImpactRow"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactRow_projectId_orderIndex_key" ON "public"."ImpactRow"("projectId", "orderIndex");

-- CreateIndex
CREATE INDEX "ImpactRowTarget_projectId_sdgTargetId_idx" ON "public"."ImpactRowTarget"("projectId", "sdgTargetId");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactRowTarget_impactRowId_sdgTargetId_key" ON "public"."ImpactRowTarget"("impactRowId", "sdgTargetId");

-- CreateIndex
CREATE INDEX "MatrixEntry_projectId_sourceSdgTargetId_targetSdgTargetId_idx" ON "public"."MatrixEntry"("projectId", "sourceSdgTargetId", "targetSdgTargetId");

-- CreateIndex
CREATE UNIQUE INDEX "MatrixEntry_projectId_sourceSdgTargetId_targetSdgTargetId_key" ON "public"."MatrixEntry"("projectId", "sourceSdgTargetId", "targetSdgTargetId");

-- CreateIndex
CREATE UNIQUE INDEX "SDGTarget_sdgId_code_key" ON "public"."SDGTarget"("sdgId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInvite_token_key" ON "public"."ProjectInvite"("token");

-- CreateIndex
CREATE INDEX "ProjectInvite_projectId_email_idx" ON "public"."ProjectInvite"("projectId", "email");

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactRow" ADD CONSTRAINT "ImpactRow_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_impactRowId_fkey" FOREIGN KEY ("impactRowId") REFERENCES "public"."ImpactRow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_sdgTargetId_fkey" FOREIGN KEY ("sdgTargetId") REFERENCES "public"."SDGTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatrixEntry" ADD CONSTRAINT "MatrixEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatrixEntry" ADD CONSTRAINT "MatrixEntry_sourceSdgTargetId_fkey" FOREIGN KEY ("sourceSdgTargetId") REFERENCES "public"."SDGTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatrixEntry" ADD CONSTRAINT "MatrixEntry_targetSdgTargetId_fkey" FOREIGN KEY ("targetSdgTargetId") REFERENCES "public"."SDGTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SDGTarget" ADD CONSTRAINT "SDGTarget_sdgId_fkey" FOREIGN KEY ("sdgId") REFERENCES "public"."SDG"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectInvite" ADD CONSTRAINT "ProjectInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectInvite" ADD CONSTRAINT "ProjectInvite_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
