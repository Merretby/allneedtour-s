import {
  BLACK_FRIDAY_KEY,
  Campaign,
  CampaignsRepository,
  CampaignScheduleInput,
} from './campaigns.repository.js';
import { ProductsRepository, Product } from '../products/products.repository.js';
import { applyCampaignPricing } from './campaigns.pricing.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';

export interface BlackFridayOverviewProduct extends Product {
  black_friday_price: number | null;
  included: boolean;
}

export interface BlackFridayOverview {
  campaign: Campaign & { active: boolean };
  products: BlackFridayOverviewProduct[];
}

export interface BlackFridayPublic {
  key: string;
  label: string;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  products: Product[];
}

const ADMIN_PRODUCT_LIMIT = 500;

export class CampaignsService {
  constructor(
    private repository: CampaignsRepository,
    private productsRepository: ProductsRepository
  ) {}

  private async getCampaignOrThrow(key: string = BLACK_FRIDAY_KEY): Promise<Campaign> {
    const campaign = await this.repository.findCampaign(key);
    if (!campaign) {
      throw AppError.notFound(
        'Campagne introuvable. Vérifiez que la migration Black Friday a été exécutée.',
        ErrorCodes.CAMPAIGN_NOT_FOUND
      );
    }
    return campaign;
  }

  async getBlackFriday(): Promise<BlackFridayPublic> {
    const campaign = await this.getCampaignOrThrow();
    const active = this.repository.isActive(campaign);

    const base = {
      key: campaign.key,
      label: campaign.label,
      active,
      starts_at: campaign.starts_at,
      ends_at: campaign.ends_at,
    };

    if (!active) {
      return { ...base, products: [] };
    }

    const promoMap = await this.repository.getActivePromoMap(campaign.key);
    if (promoMap.size === 0) {
      return { ...base, products: [] };
    }

    const { products } = await this.productsRepository.findAll(ADMIN_PRODUCT_LIMIT, 0);
    const campaignProducts = products
      .filter((product) => promoMap.has(product.id))
      .map((product) => applyCampaignPricing(product, promoMap));

    return { ...base, products: campaignProducts };
  }

  async getAdminOverview(): Promise<BlackFridayOverview> {
    const campaign = await this.getCampaignOrThrow();
    const items = await this.repository.findCampaignProducts(campaign.key);
    const priceMap = new Map(
      items.map((item) => [item.product_id, Number(item.promo_price)])
    );

    const { products } = await this.productsRepository.findAll(ADMIN_PRODUCT_LIMIT, 0);

    return {
      campaign: { ...campaign, active: this.repository.isActive(campaign) },
      products: products.map((product) => ({
        ...product,
        black_friday_price: priceMap.get(product.id) ?? null,
        included: priceMap.has(product.id),
      })),
    };
  }

  async updateCampaign(input: CampaignScheduleInput): Promise<Campaign & { active: boolean }> {
    const campaign = await this.getCampaignOrThrow();

    const normalize = (value: string | null): string | null => {
      if (value === null) return null;
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) {
        throw AppError.badRequest('Dates de campagne invalides', ErrorCodes.VALIDATION_ERROR);
      }
      return date.toISOString();
    };

    const startsAt =
      input.starts_at === undefined
        ? campaign.starts_at
        : normalize(input.starts_at);
    const endsAt =
      input.ends_at === undefined ? campaign.ends_at : normalize(input.ends_at);

    if (startsAt && endsAt && new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      throw AppError.badRequest(
        'La date de fin doit être après la date de début',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    const updated = await this.repository.updateCampaign(campaign.key, {
      ...input,
      ...(input.starts_at !== undefined ? { starts_at: startsAt } : {}),
      ...(input.ends_at !== undefined ? { ends_at: endsAt } : {}),
    });
    return { ...updated, active: this.repository.isActive(updated) };
  }

  async setProductPrice(productId: string, promoPrice: number): Promise<number> {
    const campaign = await this.getCampaignOrThrow();
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    const basePrice = Number(product.price);
    if (!Number.isFinite(promoPrice) || promoPrice <= 0 || promoPrice >= basePrice) {
      throw AppError.badRequest(
        'Le prix Black Friday doit être inférieur au prix normal',
        ErrorCodes.INVALID_CAMPAIGN_PRICE
      );
    }

    const saved = await this.repository.upsertCampaignProduct(
      campaign.key,
      productId,
      promoPrice
    );
    return Number(saved.promo_price);
  }

  async removeProduct(productId: string): Promise<void> {
    const campaign = await this.getCampaignOrThrow();
    await this.repository.removeCampaignProduct(campaign.key, productId);
  }
}
