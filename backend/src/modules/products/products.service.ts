import { ProductsRepository, Product, CreateProductInput, UpdateProductInput } from './products.repository.js';
import { CampaignsRepository } from '../campaigns/campaigns.repository.js';
import { applyCampaignPricing } from '../campaigns/campaigns.pricing.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { calculatePagination, createPaginatedResult, PaginationParams } from '../../common/utils/pagination.js';
import { uploadProductImage } from './products.storage.js';

export class ProductsService {
  constructor(
    private repository: ProductsRepository,
    private campaignsRepository: CampaignsRepository = new CampaignsRepository()
  ) {}

  async getProduct(id: string, basePricing = false): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }

    if (basePricing) return product;

    const promoMap = await this.campaignsRepository.getActivePromoMap();
    return applyCampaignPricing(product, promoMap);
  }

  async getProducts(
    params: PaginationParams & {
      category?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      basePricing?: boolean;
    }
  ) {
    const { page, limit, offset } = calculatePagination(params);
    const [{ products, total }, priceRange] = await Promise.all([
      this.repository.findAll(
      limit,
      offset,
      params.category,
      params.search,
      params.minPrice,
      params.maxPrice
      ),
      this.repository.findPriceBounds(params.category, params.search),
    ]);
    const result = createPaginatedResult(products, total, page, limit);
    const resultWithPriceRange = { ...result, priceRange };

    if (params.basePricing) return resultWithPriceRange;

    const promoMap = await this.campaignsRepository.getActivePromoMap();
    if (promoMap.size === 0) return resultWithPriceRange;

    return {
      ...resultWithPriceRange,
      data: resultWithPriceRange.data.map((product) => applyCampaignPricing(product, promoMap)),
    };
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    return this.repository.create(input);
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }
    return this.repository.update(id, input);
  }

  async uploadImage(buffer: Buffer, mimetype: string): Promise<string> {
    return uploadProductImage(buffer, mimetype);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }
    await this.repository.delete(id);
  }
}
