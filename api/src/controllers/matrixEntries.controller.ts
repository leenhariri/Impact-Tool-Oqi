// 📁 /api/src/controllers/matrixEntries.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 🔹 GET all matrix entries for a project
export const getMatrixForProject = async (req: Request, res: Response) => {
  const projectId = req.body.projectId || req.params.projectId;


  try {
    const entries = await prisma.matrixEntry.findMany({
      where: { projectId },
      include: {
        source: true,
        target: true,
      },
    });

    res.status(200).json(entries);
  } catch (error) {
    console.error('Failed to fetch matrix:', error);
    res.status(500).json({ error: 'Failed to fetch matrix' });
  }
};

// 🔹 UPSERT (create or update) a matrix entry
export const upsertMatrixEntry = async (req: Request, res: Response) => {
  const { projectId, sourceSdgTargetId, targetSdgTargetId, score, rationale } = req.body;

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

    res.status(200).json(entry);
  } catch (error) {
    console.error('Failed to upsert matrix entry:', error);
    res.status(500).json({ error: 'Failed to save entry' });
  }
};

// 🔹 DELETE all matrix entries for a project (optional)
export const clearMatrixForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    await prisma.matrixEntry.deleteMany({ where: { projectId } });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to clear matrix:', error);
    res.status(500).json({ error: 'Failed to clear matrix' });
  }
};
