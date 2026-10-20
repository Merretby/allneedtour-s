import { FastifyInstance } from 'fastify';
import type { RouteHandlerMethod } from 'fastify';
import { FavoritesController } from './favorites.controller.js';
import { FavoritesService } from './favorites.service.js';
import { FavoritesRepository } from './favorites.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';
import { validate } from '../../common/middlewares/validate.js';
import { toggleFavoriteSchema } from './favorites.schema.js';

export async function favoritesRouter(fastify: FastifyInstance): Promise<void> {
  const favoritesRepository = new FavoritesRepository();
  const productsRepository = new ProductsRepository();
  const service = new FavoritesService(favoritesRepository, productsRepository);
  const controller = new FavoritesController(service);

  fastify.get('/', { preHandler: [authenticate] }, controller.getFavorites.bind(controller) as unknown as RouteHandlerMethod);

  fastify.post(
    '/toggle',
    { preHandler: [authenticate, validate(toggleFavoriteSchema)] },
    controller.toggleFavorite.bind(controller) as unknown as RouteHandlerMethod
  );

  fastify.delete('/:productId', { preHandler: [authenticate] }, controller.removeFavorite.bind(controller) as unknown as RouteHandlerMethod);
}
