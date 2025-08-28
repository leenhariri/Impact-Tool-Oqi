// api/src/routes/diagramNodes.ts
import { Router } from "express";
import { getDiagramNodes, saveDiagramNodes } from "../controllers/diagramNode.controller";

const r = Router();

r.get("/:projectId", getDiagramNodes);
r.post("/", saveDiagramNodes);

export default r;
