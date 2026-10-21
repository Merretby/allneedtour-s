import { FastifyInstance } from 'fastify';
import { authRouter } from '../modules/auth/auth.router.js';
import { usersRouter } from '../modules/users/users.router.js';
import { productsRouter } from '../modules/products/products.router.js';
import { cartRouter } from '../modules/cart/cart.router.js';
import { ordersRouter } from '../modules/orders/orders.router.js';
import { favoritesRouter } from '../modules/favorites/favorites.router.js';
import { notificationsRouter } from '../modules/notifications/notifications.router.js';
import { campaignsRouter } from '../modules/campaigns/campaigns.router.js';
import { healthRouter } from '../modules/health/health.router.js';

export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  await fastify.register(healthRouter);

  await fastify.register(
    async (instance) => {
      await instance.register(authRouter, { prefix: '/auth' });
      await instance.register(usersRouter, { prefix: '/users' });
      await instance.register(productsRouter, { prefix: '/products' });
      await instance.register(cartRouter, { prefix: '/cart' });
      await instance.register(ordersRouter, { prefix: '/orders' });
      await instance.register(favoritesRouter, { prefix: '/favorites' });
      await instance.register(notificationsRouter, { prefix: '/notifications' });
      await instance.register(campaignsRouter, { prefix: '/campaigns' });
      await instance.register(healthRouter);
    },
    { prefix: '/api/v1' }
  );
}
