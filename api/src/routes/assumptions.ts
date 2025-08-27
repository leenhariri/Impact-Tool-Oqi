import express from 'express'
import {
  createAssumption,
  getAssumptions,
  updateAssumption,
  deleteAssumption,
  getAssumptionsForProject
} from '../controllers/assumption.controller'

const router = express.Router()

router.post('/', createAssumption)
router.get('/project/:projectId', getAssumptionsForProject)
router.get('/:projectId', getAssumptions)
router.put('/:id', updateAssumption)
router.delete('/:id', deleteAssumption)

export default router
