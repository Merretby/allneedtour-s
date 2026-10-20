import { FastifyInstance } from 'fastify';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { CartRepository } from './cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';

export async function cartRouter(fastify: FastifyInstance): Promise<void> {
  const cartRepository = new CartRepository();
  const productsRepository = new ProductsRepository();
  const service = new CartService(cartRepository, productsRepository);
  const controller = new CartController(service);

  fastify.get('/', { preHandler: [authenticate] }, controller.getCart.bind(controller));

  fastify.post('/', { preHandler: [authenticate] }, controller.addToCart.bind(controller));

  fastify.patch('/:itemId', { preHandler: [authenticate] }, controller.updateCartItem.bind(controller));

  fastify.delete('/:itemId', { preHandler: [authenticate] }, controller.removeFromCart.bind(controller));

  fastify.delete('/', { preHandler: [authenticate] }, controller.clearCart.bind(controller));
}
