import { FastifyInstance } from 'fastify';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { OrdersRepository } from './orders.repository.js';
import { CartRepository } from '../cart/cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';

export async function ordersRouter(fastify: FastifyInstance): Promise<void> {
  const ordersRepository = new OrdersRepository();
  const cartRepository = new CartRepository();
  const productsRepository = new ProductsRepository();
  const service = new OrdersService(ordersRepository, cartRepository, productsRepository);
  const controller = new OrdersController(service);

  fastify.get('/', { preHandler: [authenticate] }, controller.getOrders.bind(controller));

  fastify.get('/:id', { preHandler: [authenticate] }, controller.getOrder.bind(controller));

  fastify.post('/', { preHandler: [authenticate] }, controller.createOrder.bind(controller));

  fastify.patch('/:id/status', { preHandler: [authenticate] }, controller.updateOrderStatus.bind(controller));
}
