import { Router } from 'express'
import {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
  getActivitiesForProject
} from '../controllers/activity.controller'

const router = Router()

router.post('/', createActivity)
router.get('/project/:projectId', getActivitiesForProject)
router.get('/:projectId', getActivities)
router.put('/:id', updateActivity)
router.delete('/:id', deleteActivity)

export default router
