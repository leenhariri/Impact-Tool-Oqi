// import { verify } from "../lib/jwt";
// const COOKIE_NAME = process.env.COOKIE_NAME || "oqi_session";

// export default function requireAuth(req: any, res: any, next: any) {
//   const token = req.cookies?.[COOKIE_NAME];


//   if (!token) {
//     console.log("No token found.");
//     return res.status(401).json({ error: "unauthorized - no token" });
//   }

//   try {
//     const user = verify(token);
 
//     req.user = user;
//     next();
//   } catch (err) {
//     console.log("JWT verification failed:", err);
//     return res.status(401).json({ error: "unauthorized - invalid token" });
//   }
// }
import { verify, signSession, setCookie, COOKIE_NAME } from "../lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function requireAuth(req: any, res: any, next: any) {
  const token = req.cookies?.[COOKIE_NAME];

  // 1) JWT path (current behavior)
  if (token) {
    try {
      const user = verify(token);
      req.user = user;
      return next();
    } catch (err) {
      // fall through to SSO header bootstrap
    }
  }

  // 2) SSO header bootstrap path
  const rawEmail =
    (req.header("x-auth-request-email") ||
      req.header("x-forwarded-email") ||
      req.header("x-user-email") ||
      "").trim();

  const email = rawEmail.toLowerCase();

  if (!email) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const rawName =
    (req.header("x-auth-request-user") ||
      req.header("x-forwarded-user") ||
      req.header("x-user-name") ||
      "").trim();

  const dbUser = await prisma.user.upsert({
    where: { email },
    update: { ...(rawName ? { name: rawName } : {}) },
    create: {
      email,
      name: rawName || email.split("@")[0],
      passwordHash: null,
    },
    select: { id: true, email: true },
  });

  const newToken = signSession({ uid: dbUser.id, email: dbUser.email });
  setCookie(res, newToken);

  req.user = { uid: dbUser.id, email: dbUser.email };
  return next();
}
