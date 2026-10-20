import { z } from 'zod';

export const toggleFavoriteSchema = z.object({
  productId: z.string().uuid(),
});

export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
