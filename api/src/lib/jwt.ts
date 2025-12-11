import jwt from "jsonwebtoken";
import { validateEnv } from "../config/validateEnv";

const env = validateEnv();
const JWT_SECRET = env.JWT_SECRET;
export const COOKIE_NAME = env.COOKIE_NAME;

const isProd = process.env.NODE_ENV === "production";
const disableSecure = env.DISABLE_SECURE_COOKIE === "true";
const disableDomain = env.DISABLE_COOKIE_DOMAIN === "true";

const domain = !disableDomain && isProd
  ? new URL(env.FRONTEND_URL).hostname
  : undefined;

export function signSession(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verify(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}
// for testing
// export function setCookie(res: any, token: string) {
//   res.cookie(COOKIE_NAME, token, {
//     httpOnly: true,
//     secure: !disableSecure && isProd,
//     sameSite: isProd ? "none" : "lax",
//     path: "/",
//     domain, 
//   });
// }
// for production
export function setCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    domain: ".app.cern.ch", 
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
  res.clearCookie(COOKIE_NAME, {
    path: "/",
  });

  if (domain) {
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain,
    });
  }
}