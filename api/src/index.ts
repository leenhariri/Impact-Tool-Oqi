import dotenv from 'dotenv';
import path from 'path';



if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

import projectEditRoutes from "./routes/projectEdit.routes";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();
app.set("trust proxy", 1);

async function startServer() {

const { validateEnv } = await import("./config/validateEnv");
  const env = validateEnv(); 

  app.use(helmet());

app.use(
  cors({
    origin: "https://oqi-impact-tool.app.cern.ch",
    credentials: true,
  })
);

  app.use(express.json());
  app.use(cookieParser());

 
app.use("/api/projects", projectEditRoutes);

  app.use("/api/users",require("./routes/userRoutes").default);
  app.use("/api/auth", require("./routes/auth").default);
  app.use("/api/projects", require("./routes/projects").default);
  app.use("/api/risks", require("./routes/risks").default);
  app.use("/api/assumptions", require("./routes/assumptions").default);
  app.use("/api/stakeholders", require("./routes/stakeholders").default);
  app.use("/api/activities", require("./routes/activities").default);
  app.use("/api/impact-rows", require("./routes/impactrows").default);
  app.use("/api/impact-row-targets", require("./routes/impactrowtargets").default);
  app.use("/api/sdg-targets", require("./routes/sdgTargets").default);
  app.use("/api/sdgs", require("./routes/sdg").default);
  app.use("/api/diagram-nodes", require("./routes/diagramNode").default);
  app.use("/api/diagram-edges", require("./routes/diagramEdge").default);
  app.use("/api/project", require("./routes/matrix").default);
  app.use("/api", require("./routes/sdgTargets").default);

  app.get("/api/health", (_req: Request, res: Response) => res.json({ ok: true }));
  app.get("/", (_req: Request, res: Response) => res.send("Welcome to the API!"));

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(" Error:", err);
    res.status(err.status || 500).json({ error: "Internal server error" });
  });

  const PORT = env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API running on :${PORT}`);
  });
  console.log("FRONTEND_URL:", env.FRONTEND_URL);
}

startServer();
