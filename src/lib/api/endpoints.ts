import { apiFetch } from "./client";
import type {
  AuthResponse,
  BlackFridayAdmin,
  BlackFridayPublic,
  Campaign,
  CartItem,
  Favorite,
  Order,
  OrderStatus,
  Paginated,
  Product,
  ProductInput,
  User,
} from "./types";

interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  pricing?: "base";
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

  register: (input: { email: string; password: string; name: string; phone: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: input, auth: false }),

  me: () => apiFetch<User>("/auth/me"),
};

export const productsApi = {
  list: (params: ProductListParams = {}, options: { auth?: boolean } = {}) =>
    apiFetch<Paginated<Product>>(`/products${toQueryString(params)}`, {
      auth: options.auth ?? false,
    }),

  get: (id: string) => apiFetch<Product>(`/products/${id}`, { auth: false }),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ url: string }>("/products/upload", {
      method: "POST",
      body: formData,
    });
  },

  create: (input: ProductInput) =>
    apiFetch<Product>("/products", { method: "POST", body: input }),

  update: (id: string, input: Partial<ProductInput>) =>
    apiFetch<Product>(`/products/${id}`, { method: "PATCH", body: input }),

  remove: (id: string) => apiFetch<void>(`/products/${id}`, { method: "DELETE" }),
};

export const campaignsApi = {
  blackFriday: () =>
    apiFetch<BlackFridayPublic>("/campaigns/black-friday", { auth: false }),

  blackFridayAdmin: () =>
    apiFetch<BlackFridayAdmin>("/campaigns/black-friday/admin"),

  updateBlackFriday: (input: {
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
  }) =>
    apiFetch<Campaign>("/campaigns/black-friday", { method: "PATCH", body: input }),

  setBlackFridayProduct: (productId: string, promoPrice: number) =>
    apiFetch<{ product_id: string; promo_price: number }>(
      `/campaigns/black-friday/products/${productId}`,
      { method: "PUT", body: { promo_price: promoPrice } }
    ),

  removeBlackFridayProduct: (productId: string) =>
    apiFetch<void>(`/campaigns/black-friday/products/${productId}`, {
      method: "DELETE",
    }),
};

export const notificationsApi = {
  publicKey: () =>
    apiFetch<{ publicKey: string | null }>("/notifications/public-key", {
      auth: false,
    }),

  subscribe: (subscription: PushSubscriptionJSON) =>
    apiFetch<{ subscribed: boolean }>("/notifications/subscribe", {
      method: "POST",
      body: subscription,
    }),

  unsubscribe: (endpoint: string) =>
    apiFetch<void>("/notifications/subscribe", {
      method: "DELETE",
      body: { endpoint },
    }),

  test: () =>
    apiFetch<{ sent: number; failed: number }>("/notifications/test", {
      method: "POST",
    }),
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

  listAll: (params: OrderListParams = {}) =>
    apiFetch<Paginated<Order>>(`/orders/admin${toQueryString(params)}`),

  get: (id: string) => apiFetch<Order>(`/orders/${id}`),

  create: () => apiFetch<Order>("/orders", { method: "POST", body: {} }),

  updateStatus: (id: string, status: OrderStatus) =>
    apiFetch<Order>(`/orders/${id}/status`, { method: "PATCH", body: { status } }),
};

export const usersApi = {
  list: (params: { page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<User>>(`/users${toQueryString(params)}`),

  update: (id: string, data: { name?: string; email?: string }) =>
    apiFetch<User>(`/users/${id}`, { method: "PATCH", body: data }),

  remove: (id: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
};
