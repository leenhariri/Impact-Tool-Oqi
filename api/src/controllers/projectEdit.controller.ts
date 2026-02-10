import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


const LOCK_TTL_MS = 60_000; 
type AuthedRequest<P extends Record<string, string>> = Request<P> & {
  user?: { uid: string; email?: string; name?: string };
};
function lockIsActive(lastEditPing: Date | null) {
  if (!lastEditPing) return false;
  return Date.now() - lastEditPing.getTime() < LOCK_TTL_MS;
}


export async function startEditing(req: AuthedRequest<{ projectId: string }>, res: Response) {
  const { projectId } = req.params;
  const userId = req.user?.uid;

  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const now = new Date();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { editingByUser: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });

  const active = lockIsActive(project.lastEditPing);

  
  if (
    active &&
    project.editingByUserId &&
    project.editingByUserId !== userId
  ) {
    return res.status(423).json({
      error: "locked",
      message: "Project is currently being edited",
      editingBy: project.editingByUser
        ? {
            id: project.editingByUser.id,
            name: (project.editingByUser as any).name ?? (project.editingByUser as any).email,
            email: (project.editingByUser as any).email ?? null,
          }
        : null,
      editingSince: project.editingSince,
    });
  }

  
  await prisma.project.update({
    where: { id: projectId },
    data: {
      editingByUserId: userId,
      editingSince: project.editingSince ?? now,
      lastEditPing: now,
    },
  });

  return res.json({ ok: true });
}

export async function pingEditing(req: AuthedRequest<{ projectId: string }>, res: Response) {
  const { projectId } = req.params;
  const userId = req.user?.uid;

  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { editingByUserId: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });

  // Only lock owner can ping
  if (project.editingByUserId !== userId) {
    return res.status(403).json({ error: "not_lock_owner" });
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { lastEditPing: new Date() },
  });

  return res.json({ ok: true });
}


export async function stopEditing(req: AuthedRequest<{ projectId: string }>, res: Response) {
  const { projectId } = req.params;
  const userId = req.user?.uid;

  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { editingByUserId: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });

 
  if (project.editingByUserId !== userId) return res.json({ ok: true });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      editingByUserId: null,
      editingSince: null,
      lastEditPing: null,
    },
  });

  return res.json({ ok: true });
}
