import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();


const nodeSchema = z.object({
  nodeId: z.string().min(1),
  x: z.number(),
  y: z.number(),
});


const saveNodesSchema = z.object({
  projectId: z.string().uuid(),
  nodes: z.array(nodeSchema),
});


export const getDiagramNodes = async (req: Request<{ projectId: string }>, res: Response) => {
  const { projectId } = req.params;

  try {
    const nodes = await prisma.diagramNode.findMany({ where: { projectId } });
    res.json(nodes);
  } catch {
    res.status(500).json({ error: "Failed to fetch diagram nodes" });
  }
};


export const saveDiagramNodes = async (req: Request<{ projectId: string }>,res: Response) => {
  const parsed = saveNodesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { projectId, nodes } = parsed.data;

  try {
    
    await prisma.diagramNode.deleteMany({ where: { projectId } });

   
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
