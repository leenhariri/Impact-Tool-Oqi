-- CreateEnum
CREATE TYPE "public"."StakeholderType" AS ENUM ('DIRECT', 'INDIRECT');

-- CreateTable
CREATE TABLE "public"."Risk" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RiskHierarchy" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "hierarchy" "public"."HierarchyLevel" NOT NULL,

    CONSTRAINT "RiskHierarchy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Assumption" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Activity" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Stakeholder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "stakeholderType" "public"."StakeholderType" NOT NULL,
    "engagementStrategy" TEXT NOT NULL,
    "hierarchyLevel" "public"."HierarchyLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskHierarchy_riskId_hierarchy_key" ON "public"."RiskHierarchy"("riskId", "hierarchy");

-- CreateIndex
CREATE INDEX "Stakeholder_projectId_idx" ON "public"."Stakeholder"("projectId");

-- AddForeignKey
ALTER TABLE "public"."Risk" ADD CONSTRAINT "Risk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiskHierarchy" ADD CONSTRAINT "RiskHierarchy_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "public"."Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Assumption" ADD CONSTRAINT "Assumption_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Stakeholder" ADD CONSTRAINT "Stakeholder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."Project_title_ownerUserId_key" RENAME TO "unique_project_title_owner";
