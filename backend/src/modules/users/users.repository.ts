import { supabase } from '../../db/client.js';

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async findAll(limit: number, offset: number): Promise<{ users: User[]; total: number }> {
    const [{ data: users }, { count }] = await Promise.all([
      supabase
        .from('users')
        .select('id, email, name, created_at, updated_at')
        .range(offset, offset + limit - 1),
      supabase
        .from('users')
        .select('*', { count: 'exact', head: true }),
    ]);

    return {
      users: users || [],
      total: count || 0,
    };
  }

  async update(id: string, data: { name?: string; email?: string }): Promise<User> {
    const { data: user, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select('id, email, name, created_at, updated_at')
      .single();

    if (error) throw error;
    return user;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
  }
}
