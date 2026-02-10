
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import { signSession, setCookie, clearCookie, verifySession, COOKIE_NAME } from "../lib/jwt";
import { loginLimiter } from "../middleware/rateLimiter";

const prisma = new PrismaClient();
const r = Router();


const Register = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(1, { message: "Name is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

const Login = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});


r.post("/register", async (req, res) => {
  try {
    const { email, name, password } = Register.parse(req.body);

    const hash = await bcrypt.hash(password, 11);
    const user = await prisma.user.create({
      data: { email, name, passwordHash: hash },
    });

    const token = signSession({ uid: user.id, email: user.email });
    setCookie(res, token);

    return res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      
      return res.status(400).json({ error: "This email is already registered" });
    }

    console.error("Register error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


r.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = Login.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signSession({ uid: user.id, email: user.email });
    setCookie(res, token);

    return res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }

    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


r.post("/logout", (_req, res) => {
  clearCookie(res);
  return res.json({ ok: true });
});


r.get("/me", async (req, res) => {
  try {
   
    const token = req.cookies?.[COOKIE_NAME];
    const session = token ? verifySession(token) : null;

    if (session) {
      const dbUser = await prisma.user.findUnique({
        where: { id: session.uid }, // session.uid must be string in jwt.ts
        select: { id: true, email: true, name: true },
      });

      return res.json({
        user: {
          uid: session.uid,
          email: session.email,
          name: dbUser?.name ?? null,
        },
      });
    }

   
    const forwardedUser = (req.header("x-forwarded-user") || "").trim();

    if (!forwardedUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

   
    const email = forwardedUser.includes("@")
      ? forwardedUser.toLowerCase()
      : `${forwardedUser}@cern.ch`.toLowerCase();

    
    const rawName = forwardedUser;

  
const user = await prisma.user.upsert({
  where: { email },
  update: {},
  create: {
    email,
    name: email,
    passwordHash: null,
  },
  select: { id: true, email: true, name: true },
});


    
    const newToken = signSession({ uid: user.id, email: user.email });
    setCookie(res, newToken);

    
    return res.json({
      user: {
        uid: user.id,
        email: user.email,
        name: user.name ?? null,
      },
    });
  } catch (err) {
    console.error("Me endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


export default r;
