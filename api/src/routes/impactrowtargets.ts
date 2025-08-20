import { Router } from 'express'
import {
  addSdgTarget,
  getTargetsForRow,
  deleteTarget,
} from '../controllers/impactrowtarget.controller'

const router = Router()

router.post('/', addSdgTarget)
router.get('/:impactRowId', getTargetsForRow)
router.delete('/:id', deleteTarget)

export default router
