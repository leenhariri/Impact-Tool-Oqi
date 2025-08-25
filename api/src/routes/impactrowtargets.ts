import { Router } from 'express'
import {
  addSdgTarget,
  getTargetsForRow,
  deleteTarget,
  replaceTargetsForRow
} from '../controllers/impactrowtarget.controller'

const router = Router()

router.post('/', addSdgTarget)
router.get('/:impactRowId', getTargetsForRow)
router.delete('/:id', deleteTarget)
router.put('/:rowId', replaceTargetsForRow);


export default router
