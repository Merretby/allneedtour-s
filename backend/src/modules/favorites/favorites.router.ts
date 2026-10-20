import { FastifyInstance } from 'fastify';
import { FavoritesController } from './favorites.controller.js';
import { FavoritesService } from './favorites.service.js';
import { FavoritesRepository } from './favorites.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { authenticate } from '../../common/middlewares/auth.js';

export async function favoritesRouter(fastify: FastifyInstance): Promise<void> {
  const favoritesRepository = new FavoritesRepository();
  const productsRepository = new ProductsRepository();
  const service = new FavoritesService(favoritesRepository, productsRepository);
  const controller = new FavoritesController(service);

  fastify.get('/', { preHandler: [authenticate] }, controller.getFavorites.bind(controller));

  fastify.post('/toggle', { preHandler: [authenticate] }, controller.toggleFavorite.bind(controller));

  fastify.delete('/:productId', { preHandler: [authenticate] }, controller.removeFavorite.bind(controller));
}
