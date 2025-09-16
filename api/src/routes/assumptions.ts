import express from 'express'
import {
  createAssumption,
  getAssumptions,
  updateAssumption,
  deleteAssumption,
  getAssumptionsForProject
} from '../controllers/assumption.controller'
import requireAuth from '../../middleware/requireAuth'; 
const router = express.Router()

router.post('/', requireAuth,createAssumption)
router.get('/project/:projectId', requireAuth,getAssumptionsForProject)
router.get('/:projectId',requireAuth, getAssumptions)
router.put('/:id',requireAuth, updateAssumption)
router.delete('/:id', requireAuth,deleteAssumption)

export default router
