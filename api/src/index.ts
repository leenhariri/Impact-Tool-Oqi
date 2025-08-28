import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./routes/auth";
import projects from "./routes/projects";
import riskRoutes from './routes/risks'
import assumptionRoutes from './routes/assumptions'
import stakeholderRoutes from './routes/stakeholders'
import activityRoutes from './routes/activities'
import impactRowRoutes from './routes/impactrows'
import impactRowTargetRoutes from './routes/impactrowtargets'
import sdgTargetRoutes from './routes/sdgTargets'
import SDGs from './routes/sdg'
// import matrixRoutes from './routes/matrixEntries';

import sdgTargetsRoutes from "./routes/sdgTargets";
import diagramNodes from "./routes/diagramNode";
import diagramEdges from "./routes/diagramEdge";




import type { Request, Response } from "express";
import matrixRoutes from './routes/matrix';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api/project', matrixRoutes);
app.use("/auth", auth);
app.use("/diagram-nodes", diagramNodes);
app.use("/diagram-edges", diagramEdges);
app.use("/projects", projects);
app.use('/risks', riskRoutes)
app.use('/sdg-targets', sdgTargetRoutes);
app.use("/api", sdgTargetsRoutes);
app.use('/sdgs', SDGs); 
app.use('/assumptions', assumptionRoutes)
app.use('/stakeholders', stakeholderRoutes)
app.use('/activities', activityRoutes)
app.use('/impact-rows', impactRowRoutes)
app.use('/impact-row-targets', impactRowTargetRoutes);
// app.use('/matrix', matrixRoutes);
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the API!");
});


app.listen(4000, () => console.log("API on :4000"));
