import { FastifyRequest, FastifyReply } from 'fastify';
import { OrdersService } from './orders.service.js';
import { Order } from './orders.repository.js';
import { sendSuccess, sendCreated } from '../../common/utils/http.js';
import { AppError } from '../../common/errors/AppError.js';

export class OrdersController {
  constructor(private service: OrdersService) {}

  async getOrder(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    const order = await this.service.getOrder(userId, request.params.id);
    sendSuccess(reply, order);
  }

  async getOrders(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    const page = request.query.page ? parseInt(request.query.page) : undefined;
    const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
    const result = await this.service.getOrders(userId, { page, limit });
    sendSuccess(reply, result);
  }

  async getAllOrders(
    request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (request.user!.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
    const page = request.query.page ? parseInt(request.query.page) : undefined;
    const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
    const result = await this.service.getAllOrders({ page, limit });
    sendSuccess(reply, result);
  }

  async createOrder(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user!.userId;
    const order = await this.service.createOrder(userId);
    sendCreated(reply, order);
  }

  async updateOrderStatus(
    request: FastifyRequest<{ Params: { id: string }; Body: { status: Order['status'] } }>,
    reply: FastifyReply
  ): Promise<void> {
    if (request.user!.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
    const order = await this.service.updateOrderStatus(
      request.params.id,
      request.body.status,
      request.user!.userId
    );
    sendSuccess(reply, order);
  }
}
