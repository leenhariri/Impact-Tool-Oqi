import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CREATE Stakeholder
export const createStakeholder = async (req: Request, res: Response) => {
  const { projectId, name, role, interest, stakeholderType, engagementStrategy, hierarchyLevel } = req.body

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
    })
    res.status(201).json(stakeholder)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create stakeholder' })
  }
}

// READ Stakeholders by Project
export const getStakeholders = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const stakeholders = await prisma.stakeholder.findMany({
      where: { projectId },
    })
    res.json(stakeholders)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch stakeholders' })
  }
}

// UPDATE Stakeholder
export const updateStakeholder = async (req: Request, res: Response) => {
  const { id } = req.params
  const updates = req.body

  try {
    const updated = await prisma.stakeholder.update({
      where: { id },
      data: updates,
    })
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update stakeholder' })
  }
}

// DELETE Stakeholder
export const deleteStakeholder = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.stakeholder.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete stakeholder' })
  }
}
