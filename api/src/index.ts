//api/src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import { env } from "./config/validateEnv"; 
import auth from "./routes/auth";
import projects from "./routes/projects";
import riskRoutes from "./routes/risks";
import assumptionRoutes from "./routes/assumptions";
import stakeholderRoutes from "./routes/stakeholders";
import activityRoutes from "./routes/activities";
import impactRowRoutes from "./routes/impactrows";
import impactRowTargetRoutes from "./routes/impactrowtargets";
import sdgTargetRoutes from "./routes/sdgTargets";
import SDGs from "./routes/sdg";
import sdgTargetsRoutes from "./routes/sdgTargets";
import diagramNodes from "./routes/diagramNode";
import diagramEdges from "./routes/diagramEdge";
import matrixRoutes from "./routes/matrix";


const app = express();

//  Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

//  Routes
app.use("/api/auth", auth);
app.use("/api/projects", projects);
app.use("/api/risks", riskRoutes);
app.use("/api/assumptions", assumptionRoutes);
app.use("/api/stakeholders", stakeholderRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/impact-rows", impactRowRoutes);
app.use("/api/impact-row-targets", impactRowTargetRoutes);
app.use("/api/sdg-targets", sdgTargetRoutes);
app.use("/api/sdgs", SDGs);
app.use("/api/diagram-nodes", diagramNodes);
app.use("/api/diagram-edges", diagramEdges);
app.use("/api/project", matrixRoutes); // 
app.use("/api", sdgTargetsRoutes);


// Health endpoint
app.get("/api/health", (_req: Request, res: Response) => res.json({ ok: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the API!");
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(" Error:", err);
  res.status(err.status || 500).json({ error: "Internal server error" });
});

//  CERN OpenShift requires port 8080
const PORT = env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));

