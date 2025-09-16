import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Schema for validating incoming edge objects
const edgeSchema = z.object({
  id: z.string().uuid(),
  source: z.string().min(1),
  target: z.string().min(1),
});

const saveEdgesSchema = z.object({
  projectId: z.string().uuid(),
  edges: z.array(edgeSchema),
});

// GET edges for a project
export const getDiagramEdges = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const edges = await prisma.diagramEdge.findMany({ where: { projectId } });
    res.json(edges);
  } catch {
    res.status(500).json({ error: "Server error while fetching diagram edges" });
  }
};

// SAVE (overwrite) edges for a project
export const saveDiagramEdges = async (req: Request, res: Response) => {
  const parsed = saveEdgesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }

  const { projectId, edges } = parsed.data;

  try {
    // Clear old edges
    await prisma.diagramEdge.deleteMany({ where: { projectId } });

    // Save new edges
    const created = await prisma.diagramEdge.createMany({
      data: edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        projectId,
      })),
    });

    res.json(created);
  } catch {
    res.status(500).json({ error: "Server error while saving diagram edges" });
  }
};
