import express from "express";
import { PrismaClient } from "@prisma/client";
import requireAuth from '../middleware/requireAuth';
const router = express.Router();
const prisma = new PrismaClient();


router.get("/", requireAuth,async (_req, res) => {
  try {
    const targets = await prisma.sDGTarget.findMany({
      orderBy: { code: 'asc' }, // optional
    });
    res.json({ targets });
  } catch (err) {
   
    res.status(500).json({ error: "Failed to fetch SDG targets" });
  }
});

router.get("/project/:projectId/sdg-targets", requireAuth, async (req, res) => {
const { projectId } = req.params;


try {
const linkedTargets = await prisma.impactRowTarget.findMany({
where: { projectId },
distinct: ["sdgTargetId"],
include: {
sdgTarget: {
include: { sdg: true },
},
},
});


const targets = linkedTargets.map((entry: any) => entry.sdgTarget);

res.json(targets);
} catch (err) {

res.status(500).json({ error: "Failed to fetch project-specific targets" });
}
});

export default router;
