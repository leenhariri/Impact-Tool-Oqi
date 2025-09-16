import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod Schemas for validation
const activityCreateSchema = z.object({
  projectId: z.string().uuid(),
  text: z.string().min(1),
});

const activityUpdateSchema = z.object({
  text: z.string().min(1).optional(),
});

// CREATE Activity
export const createActivity = async (req: Request, res: Response) => {
  const parseResult = activityCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.flatten() });
  }

  const { projectId, text } = parseResult.data;

  try {
    const activity = await prisma.activity.create({ data: { projectId, text } });
    res.status(201).json(activity);
  } catch {
    res.status(500).json({ error: 'Server error while creating activity' });
  }
};

// READ Activities by Project
export const getActivities = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const activities = await prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(activities);
  } catch {
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};

// UPDATE Activity
export const updateActivity = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = activityUpdateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid update data', details: parseResult.error.flatten() });
  }

  try {
    const updated = await prisma.activity.update({
      where: { id },
      data: parseResult.data,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error while updating activity' });
  }
};

// DELETE Activity
export const deleteActivity = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.activity.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Server error while deleting activity' });
  }
};

// (Alias for getActivities)
export const getActivitiesForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const activities = await prisma.activity.findMany({ where: { projectId } });
    res.status(200).json(activities);
  } catch {
    res.status(500).json({ error: 'Server error while fetching project activities' });
  }
};
