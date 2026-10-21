export type CampaignPromoMap = Map<string, number>;

/**
 * Applies the active campaign price to a product without mutating stored data.
 * The original price becomes `compare_at_price` so the storefront can show it
 * struck through. Products without a campaign price are returned untouched.
 */
export function applyCampaignPricing<
  T extends { id: string; price: number | string; compare_at_price?: number | null },
>(product: T, promoMap: CampaignPromoMap): T {
  const promo = promoMap.get(product.id);
  if (promo === undefined) return product;

  const basePrice = Number(product.price);
  if (!Number.isFinite(basePrice) || !Number.isFinite(promo) || promo >= basePrice) {
    return product;
  }

  return {
    ...product,
    price: promo,
    compare_at_price: basePrice,
  };
}
