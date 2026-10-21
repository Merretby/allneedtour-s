import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  campaignsApi,
  cartApi,
  favoritesApi,
  ordersApi,
  productsApi,
  usersApi,
} from "@/lib/api/endpoints";
import type { OrderStatus, ProductInput, User } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";

interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

export const queryKeys = {
  products: (params: ProductListParams) => ["products", params] as const,
  product: (id: string) => ["product", id] as const,
  cart: ["cart"] as const,
  favorites: ["favorites"] as const,
  orders: ["orders"] as const,
  blackFriday: ["campaign", "black_friday"] as const,
  blackFridayAdmin: ["campaign", "black_friday", "admin"] as const,
};

/* ---------------------------------- products --------------------------------- */

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => productsApi.list(params),
  });
}

export function useProduct(id?: string) {
  return useQuery({
    queryKey: queryKeys.product(id ?? ""),
    queryFn: () => productsApi.get(id as string),
    enabled: Boolean(id),
  });
}

/* ------------------------------------ cart ----------------------------------- */

export function useCart() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.cart,
    queryFn: cartApi.get,
    enabled: isAuthenticated,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.add(productId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.update(itemId, quantity),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.cart, data);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartApi.remove(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/* --------------------------------- favorites --------------------------------- */

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: favoritesApi.list,
    enabled: isAuthenticated,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => favoritesApi.toggle(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
  });
}

/* ----------------------------------- orders ---------------------------------- */

export function useOrders() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: () => ordersApi.list({ limit: 50 }),
    enabled: isAuthenticated,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
      queryClient.invalidateQueries({ queryKey: queryKeys.cart });
    },
  });
}

/* ------------------------------------ users ---------------------------------- */

export function useUpdateProfile() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) => {
      if (!user) throw new Error("Not authenticated");
      return usersApi.update(user.id, data);
    },
    onSuccess: (updated: User) => {
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

/* ----------------------------------- admin ----------------------------------- */

export function useAllOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => ordersApi.listAll({ limit: 100 }),
    enabled: user?.role === "admin",
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders });
    },
  });
}

export function useAdminProducts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin", "products"],
    // Base pricing: admins must always see the normal price, never the
    // Black Friday price that customers see while a campaign runs.
    queryFn: () => productsApi.list({ limit: 100, pricing: "base" }),
    enabled: user?.role === "admin",
  });
}

/* ------------------------------- campaigns ------------------------------- */

export function useBlackFriday() {
  return useQuery({
    queryKey: queryKeys.blackFriday,
    queryFn: campaignsApi.blackFriday,
    retry: false,
  });
}

export function useBlackFridayAdmin() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.blackFridayAdmin,
    queryFn: campaignsApi.blackFridayAdmin,
    enabled: user?.role === "admin",
  });
}

function invalidateBlackFriday(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.blackFriday });
  queryClient.invalidateQueries({ queryKey: queryKeys.blackFridayAdmin });
  queryClient.invalidateQueries({ queryKey: ["products"] });
  queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.cart });
}

export function useUpdateBlackFriday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      is_active?: boolean;
      starts_at?: string | null;
      ends_at?: string | null;
    }) => campaignsApi.updateBlackFriday(input),
    onSuccess: () => invalidateBlackFriday(queryClient),
  });
}

export function useSetBlackFridayProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, promoPrice }: { productId: string; promoPrice: number }) =>
      campaignsApi.setBlackFridayProduct(productId, promoPrice),
    onSuccess: () => invalidateBlackFriday(queryClient),
  });
}

export function useRemoveBlackFridayProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => campaignsApi.removeBlackFridayProduct(productId),
    onSuccess: () => invalidateBlackFriday(queryClient),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ProductInput> }) =>
      productsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAdminUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => usersApi.list({ limit: 100 }),
    enabled: user?.role === "admin",
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
