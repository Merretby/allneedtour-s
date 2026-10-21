import { supabase } from '../../db/client.js';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  stock: number;
  category: string;
  brand?: string | null;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  brand?: string;
  compare_at_price?: number | null;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  image_url?: string;
  brand?: string;
  compare_at_price?: number | null;
}

export class ProductsRepository {
  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async findAll(
    limit: number,
    offset: number,
    category?: string,
    search?: string
  ): Promise<{ products: Product[]; total: number }> {
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (category) {
      const categories = category
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (categories.length === 1) {
        query = query.eq('category', categories[0]);
      } else if (categories.length > 1) {
        query = query.in('category', categories);
      }
    }

    if (search) {
      const term = search.replace(/[%_,]/g, ' ').trim();
      if (term) {
        query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%,category.ilike.%${term}%`);
      }
    }

    const { data: products, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      products: products || [],
      total: count || 0,
    };
  }

  async create(input: CreateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({ stock: quantity })
      .eq('id', id);

    if (error) throw error;
  }
}
