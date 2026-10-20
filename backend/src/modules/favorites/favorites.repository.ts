import { supabase } from '../../db/client.js';

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface FavoriteWithProduct extends Favorite {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    compare_at_price?: number | null;
    image_url?: string;
    category: string;
    brand?: string | null;
    stock?: number;
  };
}

export class FavoritesRepository {
  async findByUserId(userId: string): Promise<FavoriteWithProduct[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        product:products(id, name, description, price, compare_at_price, image_url, category, brand, stock)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Favorite | null> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) return null;
    return data;
  }

  async add(userId: string, productId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('favorites').delete().eq('id', id);
    if (error) throw error;
  }

  async removeByUserAndProduct(userId: string, productId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  }
}
