import { OrdersRepository, OrderWithItems, Order } from './orders.repository.js';
import { CartRepository } from '../cart/cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { calculatePagination, createPaginatedResult, PaginationParams } from '../../common/utils/pagination.js';

export class OrdersService {
  constructor(
    private repository: OrdersRepository,
    private cartRepository: CartRepository,
    private productsRepository: ProductsRepository
  ) {}

  async getOrder(userId: string, orderId: string): Promise<OrderWithItems> {
    const order = await this.repository.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw AppError.notFound('Order not found', ErrorCodes.ORDER_NOT_FOUND);
    }
    return order;
  }

  async getOrders(userId: string, params: PaginationParams) {
    const { page, limit, offset } = calculatePagination(params);
    const { orders, total } = await this.repository.findByUserId(userId, limit, offset);
    return createPaginatedResult(orders, total, page, limit);
  }

  async createOrder(userId: string): Promise<OrderWithItems> {
    const cartItems = await this.cartRepository.findByUserId(userId);

    if (cartItems.length === 0) {
      throw AppError.badRequest('Cart is empty', ErrorCodes.EMPTY_CART);
    }

    for (const item of cartItems) {
      const product = await this.productsRepository.findById(item.product_id);
      if (!product) {
        throw AppError.notFound(`Product ${item.product_id} not found`, ErrorCodes.PRODUCT_NOT_FOUND);
      }
      if (product.stock < item.quantity) {
        throw AppError.badRequest(
          `Insufficient stock for product ${product.name}`,
          ErrorCodes.INSUFFICIENT_STOCK
        );
      }
    }

    const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const order = await this.repository.create(userId, total);

    const orderItems = cartItems.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    await this.repository.createOrderItems(order.id, orderItems);

    for (const item of cartItems) {
      const product = await this.productsRepository.findById(item.product_id);
      if (product) {
        await this.productsRepository.updateStock(item.product_id, product.stock - item.quantity);
      }
    }

    await this.cartRepository.clearCart(userId);

    const createdOrder = await this.repository.findById(order.id);
    if (!createdOrder) {
      throw AppError.internal('Failed to create order');
    }

    return createdOrder;
  }

  async updateOrderStatus(userId: string, orderId: string, status: Order['status']): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order || order.user_id !== userId) {
      throw AppError.notFound('Order not found', ErrorCodes.ORDER_NOT_FOUND);
    }
    return this.repository.updateStatus(orderId, status);
  }
}
