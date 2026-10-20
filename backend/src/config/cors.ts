import { FastifyCorsOptions } from '@fastify/cors';
import { env } from './env.js';

export const corsOptions: FastifyCorsOptions = {
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-Total-Count'],
};
