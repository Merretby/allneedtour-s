import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import { corsOptions } from '../config/cors.js';
import { MAX_IMAGE_BYTES } from '../modules/products/products.storage.js';
import { logger } from '../config/logger.js';
import { rateLimitConfig } from '../common/middlewares/rate-limit.js';
import { errorHandler } from '../common/middlewares/error-handler.js';
import { registerRoutes } from './routes.js';

export async function createServer() {
  const fastify = Fastify({
    logger,
  });

  await fastify.register(cors, corsOptions);

  await fastify.register(multipart, {
    limits: {
      fileSize: MAX_IMAGE_BYTES,
      files: 1,
    },
  });

  await fastify.register(rateLimit, rateLimitConfig);

  fastify.setErrorHandler(errorHandler);

  await registerRoutes(fastify);

  return fastify;
}
