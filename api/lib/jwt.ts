import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = process.env.COOKIE_NAME || "oqi_session";

export function signSession(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}
export function verify(token: string) { return jwt.verify(token, JWT_SECRET) as any; }
export function setCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, secure: false, sameSite: "lax", path: "/",
  });
}
export function clearCookie(res: any) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}
