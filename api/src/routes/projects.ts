import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import requireAuth from "../../middleware/requireAuth";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { ProjectRole } from "@prisma/client";

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

    // console.log("Creating project for userId:", userId);

    // Prepare collaborators (excluding the owner)
    const collaboratorData = await Promise.all(
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

          if (!user) throw new Error(`User with email "${collab.email}" not found`);

          return {
            userId: user.id,
            role: collab.role || "EDITOR",
            addedByUserId: userId,
          };
        })
    );

    // Create the project and its members (owner + collaborators)
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
            ...collaboratorData,
          ],
        },
      },
      include: { members: true },
    });

    res.status(201).json(project);
  } catch (err) {
    // console.error("Error creating project:", err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Unknown server error" });
    }
  }
});






r.get("/", requireAuth, async (req, res) => {
  const userId = req.user!.uid;

  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: true, // ✅ this now works
        },
      },
    },
  });

  res.json({ projects });
});


r.get("/:id", requireAuth, async (req, res) => {
  const userId = req.user!.uid;
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!project) return res.status(404).json({ error: "Project not found" });

  const isMember = project.members.some((m) => m.userId === userId);
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
// console.log("User ID:", userId);
// console.log("Checking membership for:", { projectId, userId });
  try {
    // Check if user is a project member with edit rights
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
// console.log("Membership result:", membership);

    if (!membership || !["OWNER", "EDITOR"].includes(membership.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }


    // Prevent updating with empty or undefined title/desc (optional safety)
    if (!title && !description && !collaborators) {
      return res.status(400).json({ error: "No data provided for update." });
    }

    // Update project (only if title/desc provided)
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        updatedByUserId: userId,
        updatedAt: new Date(),
      },
    });

    //  Collaborators update
    if (Array.isArray(collaborators)) {
      // Remove all non-owner members (keep the OWNER intact)
      await prisma.projectMember.deleteMany({
        where: {
          projectId,
          NOT: { role: "OWNER" },
        },
      });

      // Add new collaborators
      await Promise.all(
        collaborators.map(async (collab: { email: string; role?: string }) => {
          if (!collab.email || collab.email.trim() === "") return;

          const user = await prisma.user.findUnique({
            where: { email: collab.email.trim().toLowerCase() },
          });

          if (!user) {
            throw new Error(`User with email "${collab.email}" not found`);
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
  include: { members: true }, // ✅ include members
});
    return res.json(full);
  } catch (err: any) {
    // console.error("Error updating project:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

export default r;
