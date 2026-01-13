-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "editingByUserId" TEXT,
ADD COLUMN     "editingSince" TIMESTAMP(3),
ADD COLUMN     "lastEditPing" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_editingByUserId_fkey" FOREIGN KEY ("editingByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
