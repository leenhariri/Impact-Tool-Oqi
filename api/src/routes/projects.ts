import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client"; // ✅ Added Prisma import
import requireAuth from "../middleware/requireAuth";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { ProjectRole } from "../constants/enums";

type AuthenticatedRequest = Request & {
  user: {
    uid: string;
    email: string;
  };
};

const prisma = new PrismaClient();
const r = Router();
r.use(requireAuth);

r.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const { title, description, collaborators } = req.body;

    if (!title) return res.status(400).json({ error: "Project title is required." });

    const failedEmails: string[] = [];

    const collaboratorData = await Promise.allSettled(
      (collaborators ?? [])
        .filter((collab: { email: string; role: string }) =>
          collab.email &&
          collab.email.trim() !== "" &&
          collab.email.toLowerCase().trim() !== req.user!.email?.trim().toLowerCase()
        )
        .map(async (collab: { email: string; role: string }) => {
          const user = await prisma.user.findUnique({
            where: { email: collab.email.trim().toLowerCase() },
          });

          if (!user) {
            failedEmails.push(collab.email.trim());
            return null;
          }

          return {
            userId: user.id,
            role: collab.role || "EDITOR",
            addedByUserId: userId,
          };
        })
    );

    const validCollaborators = collaboratorData
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled" && r.value)
      .map((r) => r.value);

    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerUserId: userId,
        createdByUserId: userId,
        updatedByUserId: userId,
        members: {
          create: [
            {
              userId,
              role: "OWNER",
              addedByUserId: userId,
            },
            ...validCollaborators,
          ],
        },
      },
      include: {  members: {
    include: { user: true }, 
  } },
    });

    if (failedEmails.length > 0) {
      return res.status(201).json({
        ...project,
        warning: "Some collaborators were not found.",
        missingEmails: failedEmails,
      });
    }

    res.status(201).json(project);
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return res.status(400).json({
        error: "You already have a project with this title.",
        code: "P2002"
      });
    }

    res.status(500).json({ error: err.message || "Unknown server error" });
  }
});

r.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.uid; // ✅ your JWT uses uid (keep this)

  const LOCK_TTL_MS = 60_000;
  const now = Date.now();

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },

      // ✅ ADD THIS so you can display the editor name/email
      editingByUser: true,
    },
    // optional but nice:
    // orderBy: { createdAt: "desc" },
  });

  const projectsWithEditing = projects.map((p) => {
    const active =
      !!p.editingByUserId &&
      !!p.lastEditPing &&
      now - p.lastEditPing.getTime() < LOCK_TTL_MS;

    return {
      ...p,
      currentlyEditing: active
        ? {
            name:
              (p.editingByUser as any)?.name ??
              (p.editingByUser as any)?.email ??
              "Unknown",
            since: p.editingSince,
          }
        : null,
    };
  });

  res.json({ projects: projectsWithEditing });
});


r.get("/:id", requireAuth, async (req, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  // const project = await prisma.project.findUnique({
  //   where: { id },
  //   include: { members: true },
  // });
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    members: {
      include: { user: true },
    },
  },
});

  if (!project) return res.status(404).json({ error: "Project not found" });

  const isMember = project.members.some((m: any) => m.userId === userId);

  if (!isMember) return res.status(403).json({ error: "Forbidden" });

  res.json({ project });
});

r.delete("/:id", requireAuth, async (req, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return res.status(404).json({ error: "Not found" });

  if (project.ownerUserId !== userId) {
    return res.status(403).json({ error: "Only the owner can delete the project" });
  }

  await prisma.project.delete({ where: { id } });

  res.json({ ok: true });
});

r.patch("/:projectId", requireAuth, async (req, res) => {
  const userId = req.user!.uid;
  const projectId = req.params.projectId.trim();
  const { title, description, collaborators } = req.body;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    if (!membership || !["OWNER", "EDITOR"].includes(membership.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!title && !description && !collaborators) {
      return res.status(400).json({ error: "No data provided for update." });
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        updatedByUserId: userId,
        updatedAt: new Date(),
      },
    });

    const failedEmails: string[] = [];

    if (Array.isArray(collaborators)) {
      await prisma.projectMember.deleteMany({
        where: {
          projectId,
          NOT: { role: "OWNER" },
        },
      });

      await Promise.allSettled(
        collaborators.map(async (collab: { email: string; role?: string }) => {
          if (!collab.email || collab.email.trim() === "") return;

          const user = await prisma.user.findUnique({
            where: { email: collab.email.trim().toLowerCase() },
          });

          if (!user) {
            failedEmails.push(collab.email.trim());
            return;
          }

          await prisma.projectMember.create({
            data: {
              userId: user.id,
              projectId,
              role: (collab.role as ProjectRole) || ProjectRole.EDITOR,
              addedByUserId: userId,
            },
          });
        })
      );
    }

const full = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    members: {
      include: { user: true },
    },
  },
});


    if (failedEmails.length > 0) {
      return res.status(200).json({
        ...full,
        warning: "Some collaborators were not found.",
        missingEmails: failedEmails,
      });
    }

    return res.json(full);
  } catch (err: any) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return res.status(400).json({
      error: "You already have a project with this title.",
      code: "P2002"
    });
  }

  return res.status(500).json({ error: err.message || "Server error" });
}

});

export default r;
