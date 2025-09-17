import jwt from "jsonwebtoken";
import { env } from "../config/validateEnv";

const JWT_SECRET = env.JWT_SECRET;
export const COOKIE_NAME = env.COOKIE_NAME;
const isProd = process.env.NODE_ENV === "production";

export function signSession(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
export function verify(token: string) { return jwt.verify(token, JWT_SECRET) as any; }

export function setCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    domain: isProd ? ".cern.ch" : undefined, // ✅ for SSO and consistent subdomain auth
  });
}

export function verifySession(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { uid: number; email: string };
  } catch (e) {
    return null;
  }
}
export function clearCookie(res: any) {
  // Always try clearing both with and without domain
  res.clearCookie(COOKIE_NAME, {
    path: "/",
  });

  if (isProd) {
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: ".cern.ch",
    });
  }
}


