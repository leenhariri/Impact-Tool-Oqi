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
  try {
    const { projectId, nodes } = req.body;

    if (!projectId || !Array.isArray(nodes)) {
      return res.status(400).json({ error: "Missing projectId or nodes" });
    }

    // Step 1: Delete existing diagram nodes for this project
    await prisma.diagramNode.deleteMany({ where: { projectId } });

    // Step 2: Create new nodes (omit manual id to avoid P2002 conflict)
    const created = await prisma.diagramNode.createMany({
      data: nodes.map(({ id, ...rest }: any) => ({
        nodeId: rest.nodeId,
        x: rest.x,
        y: rest.y,
        projectId,
      })),
    });

    return res.json(created);
  } catch (error: any) {
    console.error("Error saving diagram nodes:", error);
    return res.status(500).json({ error: "Failed to save diagram nodes" });
  }
};
