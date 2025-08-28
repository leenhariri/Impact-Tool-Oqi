// api/src/routes/diagramEdges.ts
import { Router } from "express";
import { getDiagramEdges, saveDiagramEdges } from "../controllers/diagramEdge.controller";

const r = Router();

r.get("/:projectId", getDiagramEdges);
r.post("/", saveDiagramEdges);

export default r;
