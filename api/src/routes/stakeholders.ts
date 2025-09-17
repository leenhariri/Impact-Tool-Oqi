import { Router } from 'express'
import {
  createStakeholder,
  getStakeholders,
  updateStakeholder,
  deleteStakeholder,
} from '../controllers/stakeholder.controller'
import requireAuth from '../middleware/requireAuth';
const router = Router()

router.post('/',requireAuth, createStakeholder)
router.get('/:projectId', requireAuth, getStakeholders)
router.put('/:id',requireAuth, updateStakeholder)
router.delete('/:id', requireAuth,deleteStakeholder)

export default router
