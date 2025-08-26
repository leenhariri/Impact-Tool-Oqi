-- DropForeignKey
ALTER TABLE "public"."ImpactRowTarget" DROP CONSTRAINT "ImpactRowTarget_projectId_fkey";

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
