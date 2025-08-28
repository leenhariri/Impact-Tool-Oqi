// api/src/controllers/diagramEdge.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getDiagramEdges = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const edges = await prisma.diagramEdge.findMany({ where: { projectId } });
  res.json(edges);
};

export const saveDiagramEdges = async (req: Request, res: Response) => {
  const { projectId, edges } = req.body;

  // Clear existing
  await prisma.diagramEdge.deleteMany({ where: { projectId } });

  // Create new
  const created = await prisma.diagramEdge.createMany({
    data: edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      projectId,
    })),
  });

  res.json(created);
};
