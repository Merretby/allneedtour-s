import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { ProductsRepository } from './products.repository.js';
import { CampaignsRepository } from '../campaigns/campaigns.repository.js';
import { authenticate, optionalAuthenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import { createProductSchema, updateProductSchema } from './products.schema.js';

export async function productsRouter(fastify: FastifyInstance): Promise<void> {
  const repository = new ProductsRepository();
  const campaignsRepository = new CampaignsRepository();
  const service = new ProductsService(repository, campaignsRepository);
  const controller = new ProductsController(service);

  fastify.get(
    '/',
    { preHandler: [optionalAuthenticate] },
    controller.getProducts.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.get(
    '/image',
    controller.proxyImage.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.get(
    '/stored-image',
    controller.getStoredImage.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.post(
    '/upload',
    { preHandler: [authenticate] },
    controller.uploadImage.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.get(
    '/:id',
    { preHandler: [optionalAuthenticate] },
    controller.getProduct.bind(controller) as unknown as RouteHandlerMethod
  );

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
