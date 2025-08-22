import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcrypt";
import { signSession, setCookie, clearCookie , verifySession,COOKIE_NAME} from "../../lib/jwt";

const prisma = new PrismaClient();
const r = Router();

const Register = z.object({ email: z.string().email(), name: z.string().min(1), password: z.string().min(6) });
const Login = z.object({ email: z.string().email(), password: z.string().min(6) });

r.post("/register", async (req, res) => {
  const { email, name, password } = Register.parse(req.body);
  const hash = await bcrypt.hash(password, 11);
  const user = await prisma.user.create({ data: { email, name, passwordHash: hash }});
  const token = signSession({ uid: user.id, email: user.email });
  setCookie(res, token);
  res.json({ user: { id: user.id, email: user.email, name: user.name }});
});

r.post("/login", async (req, res) => {
  const { email, password } = Login.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user || !user.passwordHash) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const token = signSession({ uid: user.id, email: user.email });
  setCookie(res, token);
  res.json({ user: { id: user.id, email: user.email, name: user.name }});
});

r.post("/logout", (_req, res) => { clearCookie(res); res.json({ ok: true }); });
r.get("/me", (req, res) => {
  const token = req.cookies[COOKIE_NAME];
  const session = verifySession(token);
  if (!session) return res.status(401).json({ error: "unauthorized" });
  res.json({ user: session });
});
export default r;
