import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { validate } from '../../common/middlewares/validate.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { registerSchema, loginSchema } from './auth.schema.js';

export async function authRouter(fastify: FastifyInstance): Promise<void> {
  const repository = new AuthRepository();
  const service = new AuthService(repository);
  const controller = new AuthController(service);

  fastify.post(
    '/register',
    { preHandler: [validate(registerSchema)] },
    controller.register.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.post(
    '/login',
    { preHandler: [validate(loginSchema)] },
    controller.login.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.get(
    '/me',
    { preHandler: [authenticate] },
    controller.me.bind(controller) as unknown as RouteHandlerMethod
  );
}
