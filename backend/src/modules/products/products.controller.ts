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

  private wantsBasePricing(request: FastifyRequest): boolean {
    return (
      (request as FastifyRequest<{ Querystring: { pricing?: string } }>).query
        ?.pricing === 'base' && request.user?.role === 'admin'
    );
  }

  async getProduct(
    request: FastifyRequest<{ Params: { id: string }; Querystring: { pricing?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const product = await this.service.getProduct(
      request.params.id,
      this.wantsBasePricing(request)
    );
    sendSuccess(reply, product);
  }

  async getProducts(
    request: FastifyRequest<{
      Querystring: {
        page?: string;
        limit?: string;
        category?: string;
        search?: string;
        pricing?: string;
      };
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
      basePricing: this.wantsBasePricing(request),
    });
    sendSuccess(reply, result);
  }

  async proxyImage(
    request: FastifyRequest<{ Querystring: { url?: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const rawUrl = request.query.url;
    if (!rawUrl) {
      throw AppError.badRequest('Image URL is required');
    }

    let imageUrl: URL;
    try {
      imageUrl = new URL(rawUrl);
    } catch {
      throw AppError.badRequest('Invalid image URL');
    }

    if (
      imageUrl.protocol !== 'https:' ||
      !['universparadiscount.ma', 'www.universparadiscount.ma'].includes(
        imageUrl.hostname
      )
    ) {
      throw AppError.badRequest('Image host is not allowed');
    }

    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw AppError.notFound('Product image not found');
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      throw AppError.badRequest('Remote resource is not an image');
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > 5 * 1024 * 1024) {
      throw AppError.badRequest('Product image is too large');
    }

    const image = Buffer.from(await response.arrayBuffer());
    if (image.length > 5 * 1024 * 1024) {
      throw AppError.badRequest('Product image is too large');
    }

    reply
      .header('Cache-Control', 'public, max-age=86400')
      .type(contentType)
      .send(image);
  }

  async uploadImage(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    this.assertAdmin(request);

    const file = await request.file();
    if (!file) {
      throw AppError.badRequest('Aucun fichier fourni');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw AppError.badRequest('Le fichier doit être une image');
    }

    const buffer = await file.toBuffer();
    const url = await this.service.uploadImage(buffer, file.mimetype);
    sendCreated(reply, { url });
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
