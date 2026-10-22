import { supabase } from '../../db/client.js';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  password_hash: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) return null;
    return data;
  }

  async createUser(
    email: string,
    name: string,
    phone: string,
    passwordHash: string
  ): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        phone,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }
}
