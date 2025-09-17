// api/src/routes/diagramEdges.ts
import { Router } from "express";
import { getDiagramEdges, saveDiagramEdges } from "../controllers/diagramEdge.controller";
import requireAuth from '../middleware/requireAuth';
const r = Router();

r.get("/:projectId",requireAuth, getDiagramEdges);
r.post("/", requireAuth,saveDiagramEdges);

export default r;
