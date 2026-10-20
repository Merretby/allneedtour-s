import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { cartApi, favoritesApi, ordersApi, productsApi, usersApi } from "@/lib/api/endpoints";
import type { User } from "@/lib/api/types";
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
