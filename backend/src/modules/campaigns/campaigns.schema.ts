import { z } from 'zod';

export const updateCampaignSchema = z.object({
  is_active: z.boolean().optional(),
  starts_at: z.string().min(1).nullable().optional(),
  ends_at: z.string().min(1).nullable().optional(),
});

export const setCampaignProductPriceSchema = z.object({
  promo_price: z.number().nonnegative(),
});

export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type SetCampaignProductPriceInput = z.infer<typeof setCampaignProductPriceSchema>;
