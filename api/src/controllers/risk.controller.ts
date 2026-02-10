import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();


function getQueryString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
}


export const createRisk = async (req: Request, res: Response) => {
  const { projectId, text, hierarchyLevels } = req.body;

  try {
    const newRisk = await prisma.risk.create({
      data: {
        text,
        projectId,
        hierarchies: {
          create: hierarchyLevels.map((h: string) => ({
            hierarchy: h,
          })),
        },
      },
      include: { hierarchies: true },
    });

    res.status(201).json(newRisk);
  } catch {
    res.status(500).json({ error: 'Failed to create risk' });
  }
};


export const getRisks = async (req: Request, res: Response) => {
  const projectId = getQueryString(req.query.projectId);

  if (!projectId) {
    return res.status(400).json({ error: 'Missing projectId' });
  }

  try {
    const risks = await prisma.risk.findMany({
      where: { projectId },
      include: { hierarchies: true },
    });

    res.status(200).json(risks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch risks' });
  }
};


export const getRiskById = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    const risk = await prisma.risk.findUnique({
      where: { id },
      include: { hierarchies: true },
    });

    if (!risk) return res.status(404).json({ error: 'Risk not found' });

    res.status(200).json(risk);
  } catch {
    res.status(500).json({ error: 'Failed to fetch risk' });
  }
};


export const updateRisk = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const { text, hierarchyLevels } = req.body;

  try {
   
    await prisma.riskHierarchy.deleteMany({ where: { riskId: id } });

    const updatedRisk = await prisma.risk.update({
      where: { id },
      data: {
        text,
        hierarchies: {
          create: hierarchyLevels.map((h: string) => ({
            hierarchy: h,
          })),
        },
      },
      include: { hierarchies: true },
    });

    res.status(200).json(updatedRisk);
  } catch {
    res.status(500).json({ error: 'Failed to update risk' });
  }
};


export const deleteRisk = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.risk.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Failed to delete risk' });
  }
};

export const getRisksForProject = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  const { projectId } = req.params;

  try {
    const risks = await prisma.risk.findMany({
      where: { projectId },
      include: { hierarchies: true },
    });

    res.status(200).json(risks);
  } catch {
    res.status(500).json({ error: 'Failed to fetch risks for project' });
  }
};
