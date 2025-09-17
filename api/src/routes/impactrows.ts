import { Router } from 'express'
import {
  createImpactRow,
  getImpactRows,
  updateImpactRow,
  deleteImpactRow,
} from '../controllers/impactrow.controller'
import requireAuth from '../middleware/requireAuth';
const router = Router()

router.post('/',requireAuth, createImpactRow)
router.get('/:projectId', requireAuth,getImpactRows)
router.put('/:id', requireAuth,updateImpactRow)
router.delete('/:id', requireAuth,deleteImpactRow)

export default router
