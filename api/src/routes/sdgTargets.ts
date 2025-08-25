import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// GET /sdg-targets
router.get("/", async (_req, res) => {
  try {
    const targets = await prisma.sDGTarget.findMany({
      orderBy: { code: 'asc' }, // optional
    });
    res.json({ targets });
  } catch (err) {
    console.error("Error fetching SDG targets:", err);
    res.status(500).json({ error: "Failed to fetch SDG targets" });
  }
});

export default router;
