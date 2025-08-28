-- CreateTable
CREATE TABLE "public"."DiagramNode" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagramNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DiagramEdge" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagramEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiagramNode_projectId_idx" ON "public"."DiagramNode"("projectId");

-- CreateIndex
CREATE INDEX "DiagramEdge_projectId_idx" ON "public"."DiagramEdge"("projectId");

-- AddForeignKey
ALTER TABLE "public"."DiagramNode" ADD CONSTRAINT "DiagramNode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DiagramEdge" ADD CONSTRAINT "DiagramEdge_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
