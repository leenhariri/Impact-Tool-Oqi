import express from 'express';
import {
  addSdgTarget,
  getTargetsForRow,
  deleteTarget,
  replaceTargetsForRow,
} from '../controllers/impactrowtarget.controller';

const router = express.Router();

router.post('/', addSdgTarget); // <-- this is /impact-row-targets POST
router.get('/:impactRowId', getTargetsForRow);
router.delete('/:id', deleteTarget);
router.put('/:rowId', replaceTargetsForRow);

export default router;
