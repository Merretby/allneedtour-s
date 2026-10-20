import { ProductsRepository, Product, CreateProductInput, UpdateProductInput } from './products.repository.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { calculatePagination, createPaginatedResult, PaginationParams } from '../../common/utils/pagination.js';

export class ProductsService {
  constructor(private repository: ProductsRepository) {}

  async getProduct(id: string): Promise<Product> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async getProducts(params: PaginationParams & { category?: string }) {
    const { page, limit, offset } = calculatePagination(params);
    const { products, total } = await this.repository.findAll(limit, offset, params.category);
    return createPaginatedResult(products, total, page, limit);
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

  async deleteProduct(id: string): Promise<void> {
    const product = await this.repository.findById(id);
    if (!product) {
      throw AppError.notFound('Product not found', ErrorCodes.PRODUCT_NOT_FOUND);
    }
    await this.repository.delete(id);
  }
}
