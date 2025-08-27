import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CREATE Assumption
export const createAssumption = async (req: Request, res: Response) => {
  const { projectId, text } = req.body

  try {
    const newAssumption = await prisma.assumption.create({
      data: { text, projectId },
    })
    res.status(201).json(newAssumption)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create assumption' })
  }
}

// READ all Assumptions for a project
export const getAssumptions = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const assumptions = await prisma.assumption.findMany({
      where: { projectId },
    })
    res.json(assumptions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch assumptions' })
  }
}

// UPDATE Assumption
export const updateAssumption = async (req: Request, res: Response) => {
  const { id } = req.params
  const { text } = req.body

  try {
    const updated = await prisma.assumption.update({
      where: { id },
      data: { text },
    })
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update assumption' })
  }
}

// DELETE Assumption
export const deleteAssumption = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.assumption.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete assumption' })
  }
}
export const getAssumptionsForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const assumptions = await prisma.assumption.findMany({
      where: { projectId },
    });
    res.status(200).json(assumptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assumptions for project' });
  }
};

