import { FastifyRequest, FastifyReply } from 'fastify';
import { UsersService } from './users.service.js';
import { sendSuccess, sendNoContent } from '../../common/utils/http.js';
import { AppError } from '../../common/errors/AppError.js';

export class UsersController {
  constructor(private service: UsersService) {}

  private assertSelfOrAdmin(request: FastifyRequest, targetId: string): void {
    const user = request.user!;
    if (user.userId !== targetId && user.role !== 'admin') {
      throw AppError.forbidden('You can only access your own account');
    }
  }

  async getUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertSelfOrAdmin(request, request.params.id);
    const user = await this.service.getUser(request.params.id);
    sendSuccess(reply, user);
  }

  async getUsers(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (request.user!.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
    const page = request.query.page ? parseInt(request.query.page) : undefined;
    const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
    const result = await this.service.getUsers({ page, limit });
    sendSuccess(reply, result);
  }

  async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: { name?: string; email?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertSelfOrAdmin(request, request.params.id);
    const user = await this.service.updateUser(request.params.id, request.body);
    sendSuccess(reply, user);
  }

  async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertSelfOrAdmin(request, request.params.id);
    await this.service.deleteUser(request.params.id);
    sendNoContent(reply);
  }
}
