import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// CREATE ImpactRow
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
  } = req.body

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
    })
    res.status(201).json(row)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create impact row' })
  }
}

// GET ImpactRows for a project
export const getImpactRows = async (req: Request, res: Response) => {
  const { projectId } = req.params

  try {
    const rows = await prisma.impactRow.findMany({
      where: { projectId },
      orderBy: { orderIndex: 'asc' },
    })
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch impact rows' })
  }
}

// UPDATE ImpactRow
export const updateImpactRow = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const updated = await prisma.impactRow.update({
      where: { id },
      data: req.body,
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update row' })
  }
}

// DELETE ImpactRow
export const deleteImpactRow = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.impactRow.delete({ where: { id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete row' })
  }
}
