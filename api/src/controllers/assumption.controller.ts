import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod validation schemas
const assumptionCreateSchema = z.object({
  projectId: z.string().uuid(),
  text: z.string().min(1),
});

const assumptionUpdateSchema = z.object({
  text: z.string().min(1),
});

// CREATE Assumption
export const createAssumption = async (req: Request, res: Response) => {
  const parseResult = assumptionCreateSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.flatten() });
  }

  const { projectId, text } = parseResult.data;

  try {
    const newAssumption = await prisma.assumption.create({
      data: { text, projectId },
    });
    res.status(201).json(newAssumption);
  } catch {
    res.status(500).json({ error: 'Server error while creating assumption' });
  }
};

// READ all Assumptions for a project
export const getAssumptions = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const assumptions = await prisma.assumption.findMany({
      where: { projectId },
    });
    res.json(assumptions);
  } catch {
    res.status(500).json({ error: 'Server error while fetching assumptions' });
  }
};

// UPDATE Assumption
export const updateAssumption = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parseResult = assumptionUpdateSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: 'Invalid input', details: parseResult.error.flatten() });
  }

  try {
    const updated = await prisma.assumption.update({
      where: { id },
      data: { text: parseResult.data.text },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Server error while updating assumption' });
  }
};

// DELETE Assumption
export const deleteAssumption = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.assumption.delete({ where: { id } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Server error while deleting assumption' });
  }
};

// Alias: getAssumptionsForProject
export const getAssumptionsForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  try {
    const assumptions = await prisma.assumption.findMany({
      where: { projectId },
    });
    res.status(200).json(assumptions);
  } catch {
    res.status(500).json({ error: 'Server error while fetching assumptions for project' });
  }
};
