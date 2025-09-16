import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  COOKIE_NAME: z.string().min(1),
  NODE_ENV: z.enum(["development", "production"]).optional(),
  PORT: z
    .string()
    .transform(Number)
    .refine((val) => val > 0 && val < 65536, {
      message: "PORT must be a valid number between 1 and 65535",
    })
    .optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(" Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1); // stop server before booting unsafely
}

export const env = parsed.data;
