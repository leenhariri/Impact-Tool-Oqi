// /api/src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // Limit to 10 login attempts per 15 min
  message: "Too many login attempts. Please try again later.",
});
