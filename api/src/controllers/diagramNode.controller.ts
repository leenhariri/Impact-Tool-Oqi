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

    // Step 1: Ensure all node IDs are unique
    const uniqueNodes = Object.values(
      nodes.reduce((acc: Record<string, any>, node: any) => {
        acc[node.id] = node; // last one wins if duplicates
        return acc;
      }, {})
    );

    // Step 2: Delete all old diagram nodes for this project
    await prisma.diagramNode.deleteMany({ where: { projectId } });

    // Step 3: Create new nodes
    const created = await prisma.diagramNode.createMany({
      data: uniqueNodes.map((node: any) => ({
        id: node.id,             // must be unique
        nodeId: node.nodeId,     // optional display id
        projectId,
        x: node.x,
        y: node.y,
      })),
      skipDuplicates: false, // this will throw if any id duplicates remain
    });

    return res.json(created);
  } catch (error: any) {
    console.error("Error saving diagram nodes:", error);
    return res.status(500).json({ error: "Failed to save diagram nodes" });
  }
};
