import { createServer } from './app/server.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function start() {
  try {
    const server = await createServer();

    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📚 API available at http://localhost:${env.PORT}/api/v1`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

start();
