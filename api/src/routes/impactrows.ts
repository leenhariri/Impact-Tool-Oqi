import { Router } from 'express'
import {
  createImpactRow,
  getImpactRows,
  updateImpactRow,
  deleteImpactRow,
} from '../controllers/impactrow.controller'

const router = Router()

router.post('/', createImpactRow)
router.get('/:projectId', getImpactRows)
router.put('/:id', updateImpactRow)
router.delete('/:id', deleteImpactRow)

export default router
