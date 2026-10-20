import { FastifyInstance } from 'fastify';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';

export async function productsRouter(fastify: FastifyInstance): Promise<void> {
  const repository = new ProductsRepository();
  const service = new ProductsService(repository);
  const controller = new ProductsController(service);

  fastify.get('/', controller.getProducts.bind(controller));

  fastify.get('/:id', controller.getProduct.bind(controller));

  fastify.post('/', { preHandler: [authenticate] }, controller.createProduct.bind(controller));

  fastify.patch('/:id', { preHandler: [authenticate] }, controller.updateProduct.bind(controller));

  fastify.delete('/:id', { preHandler: [authenticate] }, controller.deleteProduct.bind(controller));
}
