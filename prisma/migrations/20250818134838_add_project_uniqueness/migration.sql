/*
  Warnings:

  - A unique constraint covering the columns `[title,ownerUserId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_title_ownerUserId_key" ON "public"."Project"("title", "ownerUserId");
