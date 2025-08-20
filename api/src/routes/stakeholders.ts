import { Router } from 'express'
import {
  createStakeholder,
  getStakeholders,
  updateStakeholder,
  deleteStakeholder,
} from '../controllers/stakeholder.controller'

const router = Router()

router.post('/', createStakeholder)
router.get('/:projectId', getStakeholders)
router.put('/:id', updateStakeholder)
router.delete('/:id', deleteStakeholder)

export default router
