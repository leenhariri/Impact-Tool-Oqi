import { Router } from "express";
import requireAuth from "../middleware/requireAuth";
import { startEditing, pingEditing, stopEditing } from "../controllers/projectEdit.controller";

const router = Router();

router.post("/:projectId/edit/start", requireAuth, startEditing);
router.post("/:projectId/edit/ping", requireAuth, pingEditing);
router.post("/:projectId/edit/stop", requireAuth, stopEditing);

export default router;
