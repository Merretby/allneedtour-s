import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { corsOptions } from '../config/cors.js';
import { logger } from '../config/logger.js';
import { rateLimitConfig } from '../common/middlewares/rate-limit.js';
import { errorHandler } from '../common/middlewares/error-handler.js';
import { registerRoutes } from './routes.js';

export async function createServer() {
  const fastify = Fastify({
    logger,
  });

  await fastify.register(cors, corsOptions);

  await fastify.register(rateLimit, rateLimitConfig);

  fastify.setErrorHandler(errorHandler);

  await registerRoutes(fastify);

  return fastify;
}
