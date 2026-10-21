import { supabase } from '../../db/client.js';

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    compare_at_price?: number | null;
    image_url?: string;
    stock: number;
  };
}

export class CartRepository {
  async findByUserId(userId: string): Promise<CartItemWithProduct[]> {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(id, name, price, compare_at_price, image_url, stock)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<CartItem | null> {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) return null;
    return data;
  }

  async addItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateQuantity(id: string, quantity: number): Promise<CartItem> {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async removeItem(id: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('id', id);
    if (error) throw error;
  }

  async clearCart(userId: string): Promise<void> {
    const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);
    if (error) throw error;
  }
}
