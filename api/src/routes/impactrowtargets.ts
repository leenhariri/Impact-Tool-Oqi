import express from 'express';
import {
  addSdgTarget,
  getTargetsForRow,
  deleteTarget,
  replaceTargetsForRow,
} from '../controllers/impactrowtarget.controller';
import requireAuth from '../middleware/requireAuth';
const router = express.Router();

router.post('/',requireAuth, addSdgTarget); // <-- this is /impact-row-targets POST
router.get('/:impactRowId', requireAuth,getTargetsForRow);
router.delete('/:id', requireAuth,deleteTarget);
router.put('/:rowId', requireAuth,replaceTargetsForRow);

export default router;
