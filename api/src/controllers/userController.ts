
import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function safeQuery(q: unknown) {
  if (typeof q !== "string") return "";
  return q.trim().slice(0, 64);
}

export async function searchUsers(req: Request, res: Response) {
  try {
    const q = safeQuery(req.query.q);

    if (q.length < 1) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, email: true, name: true },
      take: 8,
      orderBy: { email: "asc" },
    });

    return res.json({ users });
  } catch {
    return res.status(500).json({ error: "Failed to search users" });
  }
}
export {};
