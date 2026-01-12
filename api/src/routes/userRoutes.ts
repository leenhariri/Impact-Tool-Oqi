// api/src/routes/userRoutes.ts
import { Router } from "express";
import requireAuth from '../middleware/requireAuth';
import { searchUsers } from "../controllers/userController";

const router = Router();

router.get("/search", requireAuth, searchUsers);

export default router;
