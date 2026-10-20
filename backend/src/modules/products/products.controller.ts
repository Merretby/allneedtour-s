import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductsService } from './products.service.js';
import { CreateProductInput, UpdateProductInput } from './products.repository.js';
import { sendSuccess, sendCreated, sendNoContent } from '../../common/utils/http.js';
import { AppError } from '../../common/errors/AppError.js';

export class ProductsController {
  constructor(private service: ProductsService) {}

  private assertAdmin(request: FastifyRequest): void {
    if (request.user?.role !== 'admin') {
      throw AppError.forbidden('Admin access required');
    }
  }

  async getProduct(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const product = await this.service.getProduct(request.params.id);
    sendSuccess(reply, product);
  }

  async getProducts(
    request: FastifyRequest<{
      Querystring: { page?: string; limit?: string; category?: string; search?: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const page = request.query.page ? parseInt(request.query.page) : undefined;
    const limit = request.query.limit ? parseInt(request.query.limit) : undefined;
    const result = await this.service.getProducts({
      page,
      limit,
      category: request.query.category,
      search: request.query.search,
    });
    sendSuccess(reply, result);
  }

  async createProduct(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);
    const product = await this.service.createProduct(request.body);
    sendCreated(reply, product);
  }

  async updateProduct(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);
    const product = await this.service.updateProduct(request.params.id, request.body);
    sendSuccess(reply, product);
  }

  async deleteProduct(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);
    await this.service.deleteProduct(request.params.id);
    sendNoContent(reply);
  }
}
