import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const createStakeholder = async (req: Request, res: Response) => {
  const {
    projectId,
    name,
    role,
    interest,
    stakeholderType,
    engagementStrategy,
    hierarchyLevel,
  } = req.body;

  try {
    const stakeholder = await prisma.stakeholder.create({
      data: {
        projectId,
        name,
        role,
        interest,
        stakeholderType,
        engagementStrategy,
        hierarchyLevel,
      },
    });

    res.status(201).json(stakeholder);
  } catch {
    res.status(500).json({ error: 'Failed to create stakeholder' });
  }
};


export const getStakeholders = async (
  req: Request<{ projectId: string }>,
  res: Response
) => {
  const { projectId } = req.params;

  try {
    const stakeholders = await prisma.stakeholder.findMany({
      where: { projectId },
    });
    res.json(stakeholders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch stakeholders' });
  }
};


export const updateStakeholder = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updated = await prisma.stakeholder.update({
      where: { id },
      data: updates,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update stakeholder' });
  }
};


export const deleteStakeholder = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;

  try {
    await prisma.stakeholder.delete({
      where: { id },
    });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete stakeholder' });
  }
};
