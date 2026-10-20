import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import { createProductSchema, updateProductSchema } from './products.schema.js';

export async function productsRouter(fastify: FastifyInstance): Promise<void> {
  const repository = new ProductsRepository();
  const service = new ProductsService(repository);
  const controller = new ProductsController(service);

  fastify.get('/', controller.getProducts.bind(controller) as unknown as RouteHandlerMethod);

  fastify.get('/:id', controller.getProduct.bind(controller) as unknown as RouteHandlerMethod);

  fastify.post(
    '/',
    { preHandler: [authenticate, validate(createProductSchema)] },
    controller.createProduct.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.patch(
    '/:id',
    { preHandler: [authenticate, validate(updateProductSchema)] },
    controller.updateProduct.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.delete('/:id', { preHandler: [authenticate] }, controller.deleteProduct.bind(controller) as unknown as RouteHandlerMethod);
}
