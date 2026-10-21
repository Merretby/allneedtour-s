import { FavoritesRepository, FavoriteWithProduct } from './favorites.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { CampaignsRepository } from '../campaigns/campaigns.repository.js';
import { applyCampaignPricing } from '../campaigns/campaigns.pricing.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export class FavoritesService {
  constructor(
    private repository: FavoritesRepository,
    private productsRepository: ProductsRepository,
    private campaignsRepository: CampaignsRepository = new CampaignsRepository()
  ) {}

  async getFavorites(userId: string): Promise<FavoriteWithProduct[]> {
    const favorites = await this.repository.findByUserId(userId);
    const promoMap = await this.campaignsRepository.getActivePromoMap();
    if (promoMap.size === 0) return favorites;

    return favorites.map((favorite) => ({
      ...favorite,
      product: applyCampaignPricing(favorite.product, promoMap),
    }));
  }

  async toggleFavorite(userId: string, productId: string): Promise<{ added: boolean }> {
    const product = await this.productsRepository.findById(productId);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    const existing = await this.repository.findByUserAndProduct(userId, productId);

    if (existing) {
      await this.repository.remove(existing.id);
      return { added: false };
    } else {
      await this.repository.add(userId, productId);
      return { added: true };
    }
  }

  async removeFavorite(userId: string, productId: string): Promise<void> {
    const existing = await this.repository.findByUserAndProduct(userId, productId);
    if (!existing) {
      throw AppError.notFound('Favorite not found', ErrorCodes.FAVORITE_NOT_FOUND);
    }
    await this.repository.remove(existing.id);
  }
}
