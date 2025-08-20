import { verify } from "../lib/jwt";
const COOKIE_NAME = process.env.COOKIE_NAME || "oqi_session";

export default function requireAuth(req: any, res: any, next: any) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "unauthorized" });
  try { req.user = verify(token); next(); }
  catch { return res.status(401).json({ error: "unauthorized" }); }
}
