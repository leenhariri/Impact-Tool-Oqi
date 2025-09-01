import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

// CREATE Risk
export const createRisk = async (req: Request, res: Response) => {
  const { projectId, text, hierarchyLevels } = req.body

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
    })

    res.status(201).json(newRisk)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create risk' })
  }
}

// READ all Risks for a project
export const getRisks = async (req: Request, res: Response) => {
  const { projectId } = req.query

  try {
    const risks = await prisma.risk.findMany({
      where: { projectId: projectId as string },
      include: { hierarchies: true },
    })

    res.status(200).json(risks)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risks' })
  }
}

// READ Risk by ID
export const getRiskById = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    const risk = await prisma.risk.findUnique({
      where: { id },
      include: { hierarchies: true },
    })

    if (!risk) return res.status(404).json({ error: 'Risk not found' })

    res.status(200).json(risk)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch risk' })
  }
}

// UPDATE Risk
export const updateRisk = async (req: Request, res: Response) => {
  const { id } = req.params
  const { text, hierarchyLevels } = req.body

  try {
    // delete existing hierarchy links
    await prisma.riskHierarchy.deleteMany({ where: { riskId: id } })

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
    })

    res.status(200).json(updatedRisk)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update risk' })
  }
}

// DELETE Risk
export const deleteRisk = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    await prisma.risk.delete({ where: { id } })
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete risk' })
  }
}
export const getRisksForProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const risks = await prisma.risk.findMany({
      where: { projectId },
      include: {
        hierarchies: true, // ✅ this ensures you get hierarchy levels
      },
    });
    res.status(200).json(risks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch risks for project' });
  }
};

