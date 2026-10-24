import rateLimit from '@fastify/rate-limit';
import { env } from '../../config/env.js';

export const rateLimitConfig = {
  max: env.RATE_LIMIT_MAX,
  timeWindow: env.RATE_LIMIT_TIMEWINDOW,
  errorResponseBuilder: () => ({
    statusCode: 429,
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  }),
};
