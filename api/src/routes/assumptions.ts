import express from 'express'
import {
  createAssumption,
  getAssumptions,
  updateAssumption,
  deleteAssumption,
} from '../controllers/assumption.controller'

const router = express.Router()

router.post('/', createAssumption)
router.get('/:projectId', getAssumptions)
router.put('/:id', updateAssumption)
router.delete('/:id', deleteAssumption)

export default router
