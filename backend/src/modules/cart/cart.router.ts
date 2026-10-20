import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { CartRepository } from './cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import { addToCartSchema, updateCartItemSchema } from './cart.schema.js';

export async function cartRouter(fastify: FastifyInstance): Promise<void> {
  const cartRepository = new CartRepository();
  const productsRepository = new ProductsRepository();
  const service = new CartService(cartRepository, productsRepository);
  const controller = new CartController(service);

  fastify.get('/', { preHandler: [authenticate] }, controller.getCart.bind(controller) as unknown as RouteHandlerMethod);

  fastify.post(
    '/',
    { preHandler: [authenticate, validate(addToCartSchema)] },
    controller.addToCart.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.patch(
    '/:itemId',
    { preHandler: [authenticate, validate(updateCartItemSchema)] },
    controller.updateCartItem.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.delete('/:itemId', { preHandler: [authenticate] }, controller.removeFromCart.bind(controller) as unknown as RouteHandlerMethod);

  fastify.delete('/', { preHandler: [authenticate] }, controller.clearCart.bind(controller) as unknown as RouteHandlerMethod);
}
