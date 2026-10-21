export interface User {
  id: string;
  email: string;
  name: string;
  role?: "customer" | "admin";
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  compare_at_price?: number | string | null;
  stock: number;
  category: string;
  brand?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  brand?: string;
  compare_at_price?: number;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    price: number | string;
    image_url?: string | null;
    stock: number;
  };
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number | string;
    compare_at_price?: number | string | null;
    category: string;
    brand?: string | null;
    image_url?: string | null;
    stock?: number;
  };
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "on_livraison"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number | string;
  created_at: string;
  product: {
    id: string;
    name: string;
    image_url?: string | null;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total: number | string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  details?: unknown;
}
