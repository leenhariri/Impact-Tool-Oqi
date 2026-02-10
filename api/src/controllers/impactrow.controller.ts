import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createImpactRow = async (req: Request, res: Response) => {
  const {
    projectId,
    hierarchyLevel,
    orderIndex,
    resultStatement,
    indicator,
    indicatorDefinition,
    meansOfMeasurement,
    baseline,
  } = req.body;

  try {
    const row = await prisma.impactRow.create({
      data: {
        projectId,
        hierarchyLevel,
        orderIndex,
        resultStatement,
        indicator,
        indicatorDefinition,
        meansOfMeasurement,
        baseline,
      },
    });

    res.status(201).json(row);
  } catch {
    res.status(500).json({ error: 'Failed to create impact row' });
  }
};


export const getImpactRows = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  const { projectId } = req.params;

  try {
    const rows = await prisma.impactRow.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
      include: {
        targets: {
          include: {
            sdgTarget: {
              include: {
                sdg: true,
              },
            },
            sdg: true,
          },
        },
      },
    });

    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to fetch impact rows' });
  }
};


export const updateImpactRow = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const {
    projectId,
    orderIndex,
    hierarchyLevel,
    resultStatement,
    indicator,
    indicatorDefinition,
    meansOfMeasurement,
    baseline,
    
  } = req.body;

  try {
    const updated = await prisma.impactRow.update({
      where: { id },
      data: {
        projectId,
        orderIndex,
        hierarchyLevel,
        resultStatement,
        indicator,
        indicatorDefinition,
        meansOfMeasurement,
        baseline,
      },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update row' });
  }
};


export const deleteImpactRow = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  try {
   
    await prisma.impactRowTarget.deleteMany({
      where: { impactRowId: id },
    });


    await prisma.impactRow.delete({
      where: { id },
    });

    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete row' });
  }
};
