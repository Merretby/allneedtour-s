import { FastifyRequest, FastifyReply } from 'fastify';
import { CartService } from './cart.service.js';
import { sendSuccess, sendNoContent } from '../../common/utils/http.js';

export class CartController {
  constructor(private service: CartService) {}

  async getCart(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user!.userId;
    const cart = await this.service.getCart(userId);
    sendSuccess(reply, cart);
  }

  async addToCart(
    request: FastifyRequest<{ Body: { productId: string; quantity: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    const { productId, quantity } = request.body;
    const cart = await this.service.addToCart(userId, productId, quantity);
    sendSuccess(reply, cart);
  }

  async updateCartItem(
    request: FastifyRequest<{ Params: { itemId: string }; Body: { quantity: number } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    const { itemId } = request.params;
    const { quantity } = request.body;
    const cart = await this.service.updateCartItem(userId, itemId, quantity);
    sendSuccess(reply, cart);
  }

  async removeFromCart(
    request: FastifyRequest<{ Params: { itemId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user!.userId;
    await this.service.removeFromCart(userId, request.params.itemId);
    sendNoContent(reply);
  }

  async clearCart(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user!.userId;
    await this.service.clearCart(userId);
    sendNoContent(reply);
  }
}
