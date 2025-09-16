import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for a single node
const nodeSchema = z.object({
  nodeId: z.string().min(1),
  x: z.number(),
  y: z.number(),
});

// Schema for the whole save request
const saveNodesSchema = z.object({
  projectId: z.string().uuid(),
  nodes: z.array(nodeSchema),
});

// GET nodes for a project
export const getDiagramNodes = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const nodes = await prisma.diagramNode.findMany({ where: { projectId } });
    res.json(nodes);
  } catch {
    res.status(500).json({ error: "Failed to fetch diagram nodes" });
  }
};

// SAVE (overwrite) nodes for a project
export const saveDiagramNodes = async (req: Request, res: Response) => {
  const parsed = saveNodesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { projectId, nodes } = parsed.data;

  try {
    // Step 1: Delete existing nodes
    await prisma.diagramNode.deleteMany({ where: { projectId } });

    // Step 2: Create new nodes
    const created = await prisma.diagramNode.createMany({
      data: nodes.map((n) => ({
        nodeId: n.nodeId,
        x: n.x,
        y: n.y,
        projectId,
      })),
    });

    return res.json(created);
  } catch {
    res.status(500).json({ error: "Failed to save diagram nodes" });
  }
};
