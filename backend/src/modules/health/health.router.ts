import { FastifyInstance } from 'fastify';

export async function healthRouter(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (request, reply) => {
    return reply.status(200).send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}
