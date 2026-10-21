import { supabase } from '../../db/client.js';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'on_livraison'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: Array<OrderItem & {
    product: {
      id: string;
      name: string;
      image_url?: string;
    };
  }>;
}

/**
 * The deployed database may still have the original status CHECK constraint
 * (pending, confirmed, shipped, delivered, cancelled), which rejects
 * "on_livraison". Until the migration is applied, "En cours de livraison" is
 * stored using the allowed "shipped" value and translated back on read.
 *
 * Once `20261021000000_add_on_livraison_status.sql` is applied, the fallback
 * in `updateStatus` is never used and real "on_livraison" values are stored.
 */
const fromDbStatus = (status: string): OrderStatus =>
  status === 'shipped' ? 'on_livraison' : (status as OrderStatus);

const isCheckConstraintError = (error: { code?: string; message?: string } | null): boolean =>
  Boolean(
    error &&
      (error.code === '23514' || /check constraint/i.test(error.message ?? ''))
  );

const withLogicalStatus = <T extends { status: string }>(order: T): T => ({
  ...order,
  status: fromDbStatus(order.status),
});

export class OrdersRepository {
  async findById(id: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(id, name, image_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return null;
    return withLogicalStatus(data);
  }

  async findByUserId(userId: string, limit: number, offset: number): Promise<{ orders: OrderWithItems[]; total: number }> {
    const [{ data: orders }, { count }] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image_url)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
    ]);

    return {
      orders: (orders || []).map(withLogicalStatus),
      total: count || 0,
    };
  }

  async create(userId: string, total: number): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        total,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return withLogicalStatus(data);
  }

  async createOrderItems(orderId: string, items: Array<{ productId: string; quantity: number; price: number }>): Promise<void> {
    const orderItems = items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error } = await supabase.from('order_items').insert(orderItems);
    if (error) throw error;
  }

  async findAll(limit: number, offset: number): Promise<{ orders: OrderWithItems[]; total: number }> {
    const [{ data: orders }, { count }] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(id, name, image_url)
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),
    ]);

    return {
      orders: (orders || []).map(withLogicalStatus),
      total: count || 0,
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    let { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    // No-DDL compatibility: if the old CHECK constraint rejects
    // "on_livraison", store the equivalent allowed value instead.
    if (error && status === 'on_livraison' && isCheckConstraintError(error)) {
      const fallback = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', id)
        .select()
        .single();

      data = fallback.data;
      error = fallback.error;
    }

    if (error) throw error;
    return { ...withLogicalStatus(data), status };
  }
}
