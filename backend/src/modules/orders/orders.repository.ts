import { supabase } from '../../db/client.js';

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
    return data;
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
      orders: orders || [],
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
    return data;
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

  async updateStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
