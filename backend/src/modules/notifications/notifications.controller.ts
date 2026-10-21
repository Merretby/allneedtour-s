import { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '../../config/env.js';
import { sendCreated, sendNoContent, sendSuccess } from '../../common/utils/http.js';
import { notificationHub } from './notifications.hub.js';
import {
  isPushEnabled,
  removeSubscription,
  saveSubscription,
  sendPushToUser,
} from './notifications.push.js';
import type { PushSubscriptionBody } from './notifications.schema.js';

export class NotificationsController {
  async getPublicKey(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    sendSuccess(reply, {
      publicKey: isPushEnabled() ? env.VAPID_PUBLIC_KEY ?? null : null,
    });
  }

  async subscribe(
    request: FastifyRequest<{ Body: PushSubscriptionBody }>,
    reply: FastifyReply
  ): Promise<void> {
    await saveSubscription(request.user!.userId, request.body);
    sendCreated(reply, { subscribed: true });
  }

  async unsubscribe(
    request: FastifyRequest<{ Body: { endpoint: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    await removeSubscription(request.user!.userId, request.body.endpoint);
    sendNoContent(reply);
  }

  async test(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const result = await sendPushToUser(request.user!.userId, {
      title: 'Test de notification',
      body: 'Les notifications fonctionnent pour ce compte.',
      url: request.user!.role === 'admin' ? '/admin' : '/orders',
    });
    sendSuccess(reply, result);
  }

  async stream(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.hijack();

    const response = reply.raw;
    const origin = request.headers.origin;

    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...(origin && env.CORS_ORIGINS.includes(origin)
        ? {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': 'true',
            Vary: 'Origin',
          }
        : {}),
    });
    response.flushHeaders();

    notificationHub.add(
      request.user!.userId,
      request.user!.role ?? 'customer',
      response
    );
  }
}
