import { FastifyRequest, FastifyReply } from 'fastify';
import { FavoritesService } from './favorites.service.js';
import { sendSuccess, sendNoContent } from '../../common/utils/http.js';

export class FavoritesController {
  constructor(private service: FavoritesService) {}

  async getFavorites(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user!.userId;
    const favorites = await this.service.getFavorites(userId);
    sendSuccess(reply, favorites);
  }

  async toggleFavorite(
    request: FastifyRequest<{ Body: { productId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    const result = await this.service.toggleFavorite(userId, request.body.productId);
    sendSuccess(reply, result);
  }

  async removeFavorite(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    await this.service.removeFavorite(userId, request.params.productId);
    sendNoContent(reply);
  }
}
