// api/src/routes/diagramNodes.ts
import { Router } from "express";
import { getDiagramNodes, saveDiagramNodes } from "../controllers/diagramNode.controller";
import requireAuth from '../../middleware/requireAuth';
const r = Router();

r.get("/:projectId", requireAuth,getDiagramNodes);
r.post("/", requireAuth,saveDiagramNodes);

export default r;
