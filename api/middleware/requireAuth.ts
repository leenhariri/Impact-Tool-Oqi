import { verify } from "../lib/jwt";
const COOKIE_NAME = process.env.COOKIE_NAME || "oqi_session";

export default function requireAuth(req: any, res: any, next: any) {
  const token = req.cookies?.[COOKIE_NAME];
  console.log("RequireAuth - Token:", token);

  if (!token) {
    console.log("No token found.");
    return res.status(401).json({ error: "unauthorized - no token" });
  }

  try {
    const user = verify(token);
    console.log("Verified user:", user);
    req.user = user;
    next();
  } catch (err) {
    console.log("JWT verification failed:", err);
    return res.status(401).json({ error: "unauthorized - invalid token" });
  }
}
