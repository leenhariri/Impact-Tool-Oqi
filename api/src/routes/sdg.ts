import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const sdgs = await prisma.sDG.findMany({ orderBy: { code: 'asc' } });
  res.json(sdgs);
});


export default router;
