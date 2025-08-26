/*
  Warnings:

  - You are about to drop the column `createdAt` on the `ImpactRowTarget` table. All the data in the column will be lost.
  - Added the required column `sdgId` to the `ImpactRowTarget` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ImpactRowTarget" DROP CONSTRAINT "ImpactRowTarget_impactRowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ImpactRowTarget" DROP CONSTRAINT "ImpactRowTarget_projectId_fkey";

-- DropIndex
DROP INDEX "public"."ImpactRowTarget_impactRowId_sdgTargetId_key";

-- DropIndex
DROP INDEX "public"."ImpactRowTarget_projectId_sdgTargetId_idx";

-- AlterTable
ALTER TABLE "public"."ImpactRowTarget" DROP COLUMN "createdAt",
ADD COLUMN     "sdgId" INTEGER NOT NULL;

-- AlterTable
CREATE SEQUENCE "public".sdg_id_seq;
ALTER TABLE "public"."SDG" ALTER COLUMN "id" SET DEFAULT nextval('"public".sdg_id_seq');
ALTER SEQUENCE "public".sdg_id_seq OWNED BY "public"."SDG"."id";

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_impactRowId_fkey" FOREIGN KEY ("impactRowId") REFERENCES "public"."ImpactRow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactRowTarget" ADD CONSTRAINT "ImpactRowTarget_sdgId_fkey" FOREIGN KEY ("sdgId") REFERENCES "public"."SDG"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
