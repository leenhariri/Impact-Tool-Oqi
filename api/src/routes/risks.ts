import { Router } from 'express'
import {
  createRisk,
  getRisks,
  getRiskById,
  updateRisk,
  deleteRisk,
  getRisksForProject
} from '../controllers/risk.controller'

const router = Router()

router.post('/', createRisk)
router.get('/', getRisks)
router.get('/project/:projectId', getRisksForProject)
router.get('/:id', getRiskById)
router.put('/:id', updateRisk)
router.delete('/:id', deleteRisk)


export default router
