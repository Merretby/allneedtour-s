import { API_BASE_URL } from "@/lib/api/client";

export function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function formatPrice(value: number | string | null | undefined): string {
  const amount = toNumber(value);
  const formatted = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2);
  return `${formatted} Dhs`;
}

export function discountPercent(
  price: number | string | null | undefined,
  compareAt: number | string | null | undefined
): number | null {
  const current = toNumber(price);
  const original = toNumber(compareAt);
  if (current <= 0 || original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

export function resolveImageUrl(url?: string | null): string {
  if (!url) return "/placeholder.svg";
  if (/^https?:\/\//.test(url)) {
    try {
      const parsed = new URL(url);
      if (
        parsed.protocol === "https:" &&
        ["universparadiscount.ma", "www.universparadiscount.ma"].includes(
          parsed.hostname
        )
      ) {
        return `${API_BASE_URL}/products/image?url=${encodeURIComponent(url)}`;
      }
    } catch {
      return "/placeholder.svg";
    }
  }
  if (/^(https?:\/\/|blob:|data:)/.test(url)) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

export const FREE_SHIPPING_THRESHOLD = 60;
export const SHIPPING_FEE = 30;

export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  shipped: "En cours de livraison",
  on_livraison: "En cours de livraison",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
