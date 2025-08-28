// api/src/controllers/diagramNode.controller.ts
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getDiagramNodes = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const nodes = await prisma.diagramNode.findMany({ where: { projectId } });
  res.json(nodes);
};

export const saveDiagramNodes = async (req: Request, res: Response) => {
  const { projectId, nodes } = req.body;

  // Clear existing
  await prisma.diagramNode.deleteMany({ where: { projectId } });

  // Create new
  const created = await prisma.diagramNode.createMany({
    data: nodes.map((node: any) => ({
      id: node.id,
      nodeId: node.nodeId,
      projectId,
      x: node.x,
      y: node.y,
    })),
  });

  res.json(created);
};
