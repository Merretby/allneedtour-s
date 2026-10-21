import { CartRepository, CartItemWithProduct } from './cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { CampaignsRepository } from '../campaigns/campaigns.repository.js';
import { applyCampaignPricing } from '../campaigns/campaigns.pricing.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class CartService {
  constructor(
    private repository: CartRepository,
    private productsRepository: ProductsRepository,
    private campaignsRepository: CampaignsRepository = new CampaignsRepository()
  ) {}

  private async withCampaignPricing(
    items: CartItemWithProduct[]
  ): Promise<CartItemWithProduct[]> {
    const promoMap = await this.campaignsRepository.getActivePromoMap();
    if (promoMap.size === 0) return items;

    return items.map((item) => ({
      ...item,
      product: applyCampaignPricing(item.product, promoMap),
    }));
  }

  async getCart(userId: string): Promise<CartItemWithProduct[]> {
    const items = await this.repository.findByUserId(userId);
    return this.withCampaignPricing(items);
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItemWithProduct[]> {
    if (quantity <= 0) {
      throw AppError.badRequest('Quantity must be positive', ErrorCodes.INVALID_QUANTITY);
    }

    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    if (product.stock < quantity) {
      throw AppError.badRequest('Insufficient stock', ErrorCodes.INSUFFICIENT_STOCK);
    }

    const existingItem = await this.repository.findByUserAndProduct(userId, productId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw AppError.badRequest('Insufficient stock', ErrorCodes.INSUFFICIENT_STOCK);
      }
      await this.repository.updateQuantity(existingItem.id, newQuantity);
    } else {
      await this.repository.addItem(userId, productId, quantity);
    }

    return this.withCampaignPricing(await this.repository.findByUserId(userId));
  }

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<CartItemWithProduct[]> {
    if (quantity <= 0) {
      throw AppError.badRequest('Quantity must be positive', ErrorCodes.INVALID_QUANTITY);
    }

    const cartItems = await this.repository.findByUserId(userId);
    const item = cartItems.find((i) => i.id === itemId);

    if (!item) {
      throw AppError.notFound('Cart item not found', ErrorCodes.CART_ITEM_NOT_FOUND);
    }

    const product = await this.productsRepository.findById(item.product_id);
    if (product && product.stock < quantity) {
      throw AppError.badRequest('Insufficient stock', ErrorCodes.INSUFFICIENT_STOCK);
    }

    await this.repository.updateQuantity(itemId, quantity);
    return this.withCampaignPricing(await this.repository.findByUserId(userId));
  }

  async removeFromCart(userId: string, itemId: string): Promise<void> {
    const cartItems = await this.repository.findByUserId(userId);
    const item = cartItems.find((i) => i.id === itemId);

    if (!item) {
      throw AppError.notFound('Cart item not found', ErrorCodes.CART_ITEM_NOT_FOUND);
    }

    await this.repository.removeItem(itemId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.repository.clearCart(userId);
  }
}
