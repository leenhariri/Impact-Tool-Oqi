import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// --- Validation Schemas ---
const upsertSchema = z.object({
  projectId: z.string().uuid(),
  sourceSdgTargetId: z.string().uuid(),
  targetSdgTargetId: z.string().uuid(),
  score: z.union([
  z.number().int().min(-3).max(3),
  z.null()
]),

  rationale: z.string().max(1000).optional(),
});

//  GET all matrix entries for a project
export const getMatrixForProject = async (req: Request, res: Response) => {
  const projectId = req.params.projectId || req.body.projectId;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid projectId' });
  }

  try {
    const entries = await prisma.matrixEntry.findMany({
      where: { projectId },
      include: {
        source: true,
        target: true,
      },
    });

    return res.status(200).json(entries);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(' Failed to fetch matrix:', error);
    }
    return res.status(500).json({ error: 'Failed to fetch matrix' });
  }
};

// 🔹 UPSERT (create or update) a matrix entry
export const upsertMatrixEntry = async (req: Request, res: Response) => {
  const parsed = upsertSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { projectId, sourceSdgTargetId, targetSdgTargetId, score, rationale } = parsed.data;

  try {
    const entry = await prisma.matrixEntry.upsert({
      where: {
        projectId_sourceSdgTargetId_targetSdgTargetId: {
          projectId,
          sourceSdgTargetId,
          targetSdgTargetId,
        },
      },
      update: {
        score,
        rationale,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        sourceSdgTargetId,
        targetSdgTargetId,
        score,
        rationale,
      },
    });

    return res.status(200).json(entry);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(' Failed to upsert matrix entry:', error);
    }
    return res.status(500).json({ error: 'Failed to save matrix entry' });
  }
};

// 🔹 DELETE all matrix entries for a project
export const clearMatrixForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  if (!projectId || typeof projectId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid projectId' });
  }

  try {
    await prisma.matrixEntry.deleteMany({ where: { projectId } });
    return res.status(204).send();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(' Failed to clear matrix:', error);
    }
    return res.status(500).json({ error: 'Failed to clear matrix entries' });
  }
};