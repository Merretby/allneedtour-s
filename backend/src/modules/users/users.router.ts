import { FastifyInstance } from 'fastify';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';

export async function usersRouter(fastify: FastifyInstance): Promise<void> {
  const repository = new UsersRepository();
  const service = new UsersService(repository);
  const controller = new UsersController(service);

  fastify.get('/', { preHandler: [authenticate] }, controller.getUsers.bind(controller));

  fastify.get('/:id', { preHandler: [authenticate] }, controller.getUser.bind(controller));

  fastify.patch('/:id', { preHandler: [authenticate] }, controller.updateUser.bind(controller));

  fastify.delete('/:id', { preHandler: [authenticate] }, controller.deleteUser.bind(controller));
}
