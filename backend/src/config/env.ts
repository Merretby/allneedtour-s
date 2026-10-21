import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:1122'),
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_TIMEWINDOW: z.string().default('60000'),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().default('mailto:admin@example.com'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = {
  PORT: parseInt(parsedEnv.data.PORT, 10),
  NODE_ENV: parsedEnv.data.NODE_ENV,
  DATABASE_URL: parsedEnv.data.DATABASE_URL,
  SUPABASE_URL: parsedEnv.data.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: parsedEnv.data.SUPABASE_SERVICE_KEY,
  JWT_SECRET: parsedEnv.data.JWT_SECRET,
  JWT_EXPIRES_IN: parsedEnv.data.JWT_EXPIRES_IN,
  CORS_ORIGINS: parsedEnv.data.CORS_ORIGINS.split(',').map((origin) => origin.trim()),
  RATE_LIMIT_MAX: parseInt(parsedEnv.data.RATE_LIMIT_MAX, 10),
  RATE_LIMIT_TIMEWINDOW: parseInt(parsedEnv.data.RATE_LIMIT_TIMEWINDOW, 10),
  VAPID_PUBLIC_KEY: parsedEnv.data.VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY: parsedEnv.data.VAPID_PRIVATE_KEY,
  VAPID_SUBJECT: parsedEnv.data.VAPID_SUBJECT,
};
