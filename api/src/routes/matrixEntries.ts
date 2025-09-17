// /api/src/routes/matrixEntries.ts

import express from 'express';
import {
  getMatrixForProject,
  upsertMatrixEntry,
  clearMatrixForProject,
} from '../controllers/matrixEntries.controller';
import requireAuth from '../middleware/requireAuth';
const router = express.Router();

router.get('/:projectId', requireAuth,getMatrixForProject);
router.post('/', requireAuth,upsertMatrixEntry);
router.delete('/:projectId',requireAuth, clearMatrixForProject);

export default router;
