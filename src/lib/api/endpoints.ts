import { apiFetch } from "./client";
import type {
  AuthResponse,
  CartItem,
  Favorite,
  Order,
  Paginated,
  Product,
  User,
} from "./types";

interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

interface OrderListParams {
  page?: number;
  limit?: number;
}

function toQueryString(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const authApi = {
  login: (input: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input, auth: false }),

  register: (input: { email: string; password: string; name: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input, auth: false }),

  me: () => apiFetch<User>("/auth/me"),
};

export const productsApi = {
  list: (params: ProductListParams = {}) =>
    apiFetch<Paginated<Product>>(`/products${toQueryString(params)}`, { auth: false }),

  get: (id: string) => apiFetch<Product>(`/products/${id}`, { auth: false }),
};

export const cartApi = {
  get: () => apiFetch<CartItem[]>("/cart"),

  add: (productId: string, quantity: number) =>
    apiFetch<CartItem[]>("/cart", { method: "POST", body: { productId, quantity } }),

  update: (itemId: string, quantity: number) =>
    apiFetch<CartItem[]>(`/cart/${itemId}`, { method: "PATCH", body: { quantity } }),

  remove: (itemId: string) => apiFetch<void>(`/cart/${itemId}`, { method: "DELETE" }),

  clear: () => apiFetch<void>("/cart", { method: "DELETE" }),
};

export const favoritesApi = {
  list: () => apiFetch<Favorite[]>("/favorites"),

  toggle: (productId: string) =>
    apiFetch<{ added: boolean }>("/favorites/toggle", { method: "POST", body: { productId } }),

  remove: (productId: string) =>
    apiFetch<void>(`/favorites/${productId}`, { method: "DELETE" }),
};

export const ordersApi = {
  list: (params: OrderListParams = {}) =>
    apiFetch<Paginated<Order>>(`/orders${toQueryString(params)}`),

  get: (id: string) => apiFetch<Order>(`/orders/${id}`),

  create: () => apiFetch<Order>("/orders", { method: "POST", body: {} }),
};

export const usersApi = {
  update: (id: string, data: { name?: string; email?: string }) =>
    apiFetch<User>(`/users/${id}`, { method: "PATCH", body: data }),
};
