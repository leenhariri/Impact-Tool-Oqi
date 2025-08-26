import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ CREATE (Add SDG + SDG Target)
// ✅ Replace old mapping (if exists) before adding a new one
export const addSdgTarget = async (req: Request, res: Response) => {
  const { projectId, impactRowId, sdgId, sdgTargetId } = req.body;

  try {
    // Delete existing mapping (if any)
    await prisma.impactRowTarget.deleteMany({
      where: { impactRowId }
    });

    // Add new mapping
    const link = await prisma.impactRowTarget.create({
      data: {
        projectId,
        impactRowId,
        sdgId: Number(sdgId),
        sdgTargetId,
      },
    });

    res.status(201).json(link);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update SDG target for this row' });
  }
};


// ✅ READ (Get SDG + SDG Targets for a row)
export const getTargetsForRow = async (req: Request, res: Response) => {
  const { impactRowId } = req.params;

  try {
    const targets = await prisma.impactRowTarget.findMany({
      where: { impactRowId },
      include: {
        sdgTarget: {
          include: {
            sdg: true,
          },
        },
        sdg: true, // ✅ include SDG directly as well
      },
    });

    res.json(targets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch SDG targets' });
  }
};

// ✅ DELETE
export const deleteTarget = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.impactRowTarget.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete target' });
  }
};

// ✅ UPDATE (Replace all targets for a row with new SDG + SDG targets)
export const replaceTargetsForRow = async (req: Request, res: Response) => {
  const { rowId } = req.params;
  const { sdgTargetIds, sdgId, projectId } = req.body;

  try {
    // Validate all targets
    const validTargets = await prisma.sDGTarget.findMany({
      where: {
        id: { in: sdgTargetIds },
        sdgId: Number(sdgId),
      },
    });

    if (validTargets.length !== sdgTargetIds.length) {
      return res.status(400).json({
        error: 'Some SDG Target IDs do not belong to the provided SDG',
      });
    }
if (!sdgTargetIds || sdgTargetIds.length === 0 || !sdgId) {
  await prisma.impactRowTarget.deleteMany({ where: { impactRowId: rowId } });
  return res.status(200).json([]); // return empty if all were removed
}

    // Replace logic
    await prisma.impactRowTarget.deleteMany({
      where: { impactRowId: rowId },
    });

    const created = await Promise.all(
      sdgTargetIds.map((targetId: string) =>
        prisma.impactRowTarget.create({
          data: {
            projectId,
            impactRowId: rowId,
            sdgId: Number(sdgId),
            sdgTargetId: targetId,
          },
        })
      )
    );

    res.status(200).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to replace SDG targets' });
  }
};

