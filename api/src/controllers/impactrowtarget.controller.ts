import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// --- Validation Schemas ---
const addTargetSchema = z.object({
  projectId: z.string().uuid(),
  impactRowId: z.string().uuid(),
  sdgId: z.coerce.number(),
  sdgTargetId: z.string().uuid(),
});

const replaceTargetsSchema = z.object({
  projectId: z.string().uuid(),
  sdgId: z.coerce.number(),
  sdgTargetIds: z.array(z.string().uuid()),
});

// --- ADD SDG + SDG Target ---
export const addSdgTarget = async (req: Request, res: Response) => {
  const parsed = addTargetSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { projectId, impactRowId, sdgId, sdgTargetId } = parsed.data;

  try {
    await prisma.impactRowTarget.deleteMany({ where: { impactRowId } });

    const link = await prisma.impactRowTarget.create({
      data: { projectId, impactRowId, sdgId, sdgTargetId },
    });

    return res.status(201).json(link);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in addSdgTarget:', error);
    }
    return res.status(500).json({ error: 'Failed to update SDG target for this row' });
  }
};

// --- GET SDG Targets for a row ---
export const getTargetsForRow = async (req: Request, res: Response) => {
  const { impactRowId } = req.params;

  if (!impactRowId || typeof impactRowId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid impactRowId' });
  }

  try {
    const targets = await prisma.impactRowTarget.findMany({
      where: { impactRowId },
      include: {
        sdgTarget: { include: { sdg: true } },
        sdg: true,
      },
    });

    return res.json(targets);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in getTargetsForRow:', error);
    }
    return res.status(500).json({ error: 'Failed to fetch SDG targets' });
  }
};

// --- DELETE one SDG target link ---
export const deleteTarget = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid target ID' });
  }

  try {
    await prisma.impactRowTarget.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in deleteTarget:', error);
    }
    return res.status(500).json({ error: 'Failed to delete target' });
  }
};

// --- REPLACE all SDG Targets for a row ---
export const replaceTargetsForRow = async (req: Request, res: Response) => {
  const { rowId } = req.params;

  if (!rowId || typeof rowId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid rowId' });
  }

  const parsed = replaceTargetsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
  }

  const { sdgId, sdgTargetIds, projectId } = parsed.data;

  try {
    // Validate existence of all target IDs under that SDG
    const validTargets = await prisma.sDGTarget.findMany({
      where: {
        id: { in: sdgTargetIds },
        sdgId,
      },
    });

    if (validTargets.length !== sdgTargetIds.length) {
      return res.status(400).json({
        error: 'Some SDG Target IDs do not belong to the provided SDG',
      });
    }

    // If empty array, just delete and return
    if (sdgTargetIds.length === 0) {
      await prisma.impactRowTarget.deleteMany({ where: { impactRowId: rowId } });
      return res.status(200).json([]);
    }

    // Delete existing targets
    await prisma.impactRowTarget.deleteMany({ where: { impactRowId: rowId } });

    // Add new ones
    const created = await Promise.all(
      sdgTargetIds.map((targetId: string) =>
        prisma.impactRowTarget.create({
          data: { projectId, impactRowId: rowId, sdgId, sdgTargetId: targetId },
        })
      )
    );

    return res.status(200).json(created);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in replaceTargetsForRow:', error);
    }
    return res.status(500).json({ error: 'Failed to replace SDG targets' });
  }
};
