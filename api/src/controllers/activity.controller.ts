import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CREATE Activity
export const createActivity = async (req: Request, res: Response) => {
  const { projectId, text } = req.body

  try {
    const activity = await prisma.activity.create({
      data: { projectId, text },
    })
    res.status(201).json(activity)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create activity' })
  }
}

// READ Activities by Project
export const getActivities = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const activities = await prisma.activity.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    })
    res.json(activities)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch activities' })
  }
}

// UPDATE Activity
export const updateActivity = async (req: Request, res: Response) => {
  const { id } = req.params
  const updates = req.body

  try {
    const updated = await prisma.activity.update({
      where: { id },
      data: updates,
    })
    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update activity' })
  }
}

// DELETE Activity
export const deleteActivity = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.activity.delete({
      where: { id },
    })
    res.status(204).send()
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete activity' })
  }
}
