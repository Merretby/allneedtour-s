import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { authenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import { NotificationsController } from './notifications.controller.js';
import { pushSubscriptionSchema, unsubscribeSchema } from './notifications.schema.js';

export async function notificationsRouter(fastify: FastifyInstance): Promise<void> {
  const controller = new NotificationsController();

  fastify.get(
    '/public-key',
    controller.getPublicKey.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.get(
    '/stream',
    { preHandler: [authenticate] },
    controller.stream.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.post(
    '/subscribe',
    { preHandler: [authenticate, validate(pushSubscriptionSchema)] },
    controller.subscribe.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.delete(
    '/subscribe',
    { preHandler: [authenticate, validate(unsubscribeSchema)] },
    controller.unsubscribe.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.post(
    '/test',
    { preHandler: [authenticate] },
    controller.test.bind(controller) as unknown as RouteHandlerMethod
  );
}
