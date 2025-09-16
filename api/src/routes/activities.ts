import { Router } from 'express';
import {
  createActivity,
  getActivities,
  updateActivity,
  deleteActivity,
  getActivitiesForProject,
} from '../controllers/activity.controller';
import requireAuth from '../../middleware/requireAuth'; // ✅ adjust path if needed

const router = Router();

router.post('/', requireAuth, createActivity);
router.get('/project/:projectId', requireAuth, getActivitiesForProject);
router.get('/:projectId', requireAuth, getActivities);
router.put('/:id', requireAuth, updateActivity);
router.delete('/:id', requireAuth, deleteActivity);

export default router;
