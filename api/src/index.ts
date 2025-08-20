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



import type { Request, Response } from "express";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", auth);
app.use("/projects", projects);
app.use('/risks', riskRoutes)  
app.use('/assumptions', assumptionRoutes)
app.use('/stakeholders', stakeholderRoutes)
app.use('/activities', activityRoutes)
app.use('/impact-rows', impactRowRoutes)
app.use('/impact-row-targets', impactRowTargetRoutes)
app.get("/health", (_req: Request, res: Response) => res.json({ ok: true }));
app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to the API!");
});


app.listen(4000, () => console.log("API on :4000"));
