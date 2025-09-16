// api/src/routes/matrix.ts
import express from "express";
import { PrismaClient } from "@prisma/client";
import requireAuth from '../../middleware/requireAuth';
const router = express.Router({ mergeParams: true }); // ✅ not default

const prisma = new PrismaClient();

// GET matrix values
router.get("/:projectId/matrix",requireAuth, async (req, res) => {
  const { projectId } = req.params;

  try {
    const entries = await prisma.matrixEntry.findMany({
      where: { projectId },
    });

    res.json(entries);
  } catch (err) {
    // console.error("Failed to fetch matrix entries:", err);
    res.status(500).json({ error: "Could not load matrix data" });
  }
});

// POST (update or create entry)
router.post("/:projectId/matrix", requireAuth, async (req, res) => {
  const { projectId } = req.params;
  const { sourceSdgTargetId, targetSdgTargetId, score, rationale } = req.body;

  // console.log("🟡 Incoming matrix POST", {
  //   projectId,
  //   sourceSdgTargetId,
  //   targetSdgTargetId,
  //   score,
  //   rationale
  // });

  try {
    const entry = await prisma.matrixEntry.upsert({
      where: {
        projectId_sourceSdgTargetId_targetSdgTargetId: {
          projectId,
          sourceSdgTargetId,
          targetSdgTargetId,
        },
      },
      update: {
        score,
        rationale,
        updatedAt: new Date(),
      },
      create: {
        projectId,
        sourceSdgTargetId,
        targetSdgTargetId,
        score,
        rationale,
      },
    });

    // console.log("🟢 Upsert success:", entry);
    res.status(200).json(entry);
  } catch (err: any) {
    // console.error("🔴 Upsert failed:", err);
    res.status(500).json({ error: "Could not update matrix", details: err.message });
  }
});



export default router;
