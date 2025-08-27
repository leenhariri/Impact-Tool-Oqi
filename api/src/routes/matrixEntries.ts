// /api/src/routes/matrixEntries.ts

import express from 'express';
import {
  getMatrixForProject,
  upsertMatrixEntry,
  clearMatrixForProject,
} from '../controllers/matrixEntries.controller';

const router = express.Router();

router.get('/:projectId', getMatrixForProject);
router.post('/', upsertMatrixEntry);
router.delete('/:projectId', clearMatrixForProject);

export default router;
