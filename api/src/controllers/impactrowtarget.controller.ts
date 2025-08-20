import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add SDG Target to an Impact Row
export const addSdgTarget = async (req: Request, res: Response) => {
  const { projectId, impactRowId, sdgTargetId } = req.body

  try {
    const link = await prisma.impactRowTarget.create({
      data: { projectId, impactRowId, sdgTargetId },
    })
    res.status(201).json(link)
  } catch (error) {
    res.status(500).json({ error: 'Failed to add SDG Target' })
  }
}

// Get SDG Targets for a row
export const getTargetsForRow = async (req: Request, res: Response) => {
  const { impactRowId } = req.params

  try {
    const targets = await prisma.impactRowTarget.findMany({
      where: { impactRowId },
      include: { sdgTarget: true },
    })
    res.json(targets)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SDG targets' })
  }
}

// Remove SDG Target
export const deleteTarget = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.impactRowTarget.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete target' })
  }
}
