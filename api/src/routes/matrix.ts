// api/src/routes/matrix.ts
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET matrix values
router.get("/:projectId/matrix", async (req, res) => {
  const { projectId } = req.params;

  try {
    const entries = await prisma.matrixEntry.findMany({
      where: { projectId },
    });

    res.json(entries);
  } catch (err) {
    console.error("Failed to fetch matrix entries:", err);
    res.status(500).json({ error: "Could not load matrix data" });
  }
});

// POST (update or create entry)
router.post("/:projectId/matrix", async (req, res) => {
const { projectId } = req.params;
const { sourceSdgTargetId, targetSdgTargetId, score, rationale } = req.body;

  try {
    const entry = await prisma.matrixEntry.upsert({
      where: {
        projectId_sourceSdgTargetId_targetSdgTargetId: {
          projectId,
          sourceSdgTargetId,
          targetSdgTargetId,
        },
      },
update: { score, rationale },
create: {
  projectId,
  sourceSdgTargetId,
  targetSdgTargetId,
  score,
  rationale,
},

    });

    res.status(200).json(entry);
  } catch (err) {
    console.error("Matrix entry update failed:", err);
    res.status(500).json({ error: "Could not update matrix" });
  }
});

export default router;
