
import { verify, signSession, setCookie, COOKIE_NAME } from "../lib/jwt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function requireAuth(req: any, res: any, next: any) {
  const token = req.cookies?.[COOKIE_NAME];

 
  if (token) {
    try {
      const user = verify(token);
      req.user = user;
      return next();
    } catch (err) {
      
    }
  }


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
