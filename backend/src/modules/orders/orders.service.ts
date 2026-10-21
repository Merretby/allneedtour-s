import { OrdersRepository, OrderWithItems, Order } from './orders.repository.js';
import { CartRepository } from '../cart/cart.repository.js';
import { ProductsRepository } from '../products/products.repository.js';
import { AppError } from '../../common/errors/AppError.js';
import { ErrorCodes } from '../../common/errors/error-codes.js';
import { calculatePagination, createPaginatedResult, PaginationParams } from '../../common/utils/pagination.js';
import { logger } from '../../config/logger.js';
import { notificationHub } from '../notifications/notifications.hub.js';
import { sendPushToAdmins, sendPushToUser } from '../notifications/notifications.push.js';

const FREE_SHIPPING_THRESHOLD = 60;
const SHIPPING_FEE = 30;

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'En cours de livraison',
  on_livraison: 'En cours de livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

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

  async getAllOrders(params: PaginationParams) {
    const { page, limit, offset } = calculatePagination(params);
    const { orders, total } = await this.repository.findAll(limit, offset);
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

    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

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

    notificationHub.sendToAdmins('new_order', {
      orderId: createdOrder.id,
      total: createdOrder.total,
      userId: createdOrder.user_id,
    });

    void sendPushToAdmins({
      title: 'Nouvelle commande',
      body: `Commande #${createdOrder.id.slice(0, 8)} — ${Number(createdOrder.total).toFixed(2)} Dhs`,
      url: '/admin',
      tag: `new-order-${createdOrder.id}`,
    }).catch((error) => {
      logger.warn({ err: error }, 'Failed to send new order push notification');
    });

    return createdOrder;
  }

  // Admin-only: callers must verify the admin role before calling this.
  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    actorId?: string
  ): Promise<Order> {
    const order = await this.repository.findById(orderId);
    if (!order) {
      throw AppError.notFound('Order not found', ErrorCodes.ORDER_NOT_FOUND);
    }

    const updated = await this.repository.updateStatus(orderId, status);

    // Only notify when the status actually changed.
    if (order.status !== status) {
      notificationHub.sendToUser(order.user_id, 'order_status', {
        orderId: updated.id,
        status,
        actorId: actorId ?? null,
      });

      void sendPushToUser(order.user_id, {
        title: 'Commande mise à jour',
        body: `Votre commande est maintenant : ${
          ORDER_STATUS_LABELS[status] ?? status
        }`,
        url: '/orders',
        tag: `order-${updated.id}`,
      }).catch((error) => {
        logger.warn(
          { err: error },
          'Failed to send order status push notification'
        );
      });
    }

    return updated;
  }
}
