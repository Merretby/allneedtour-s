import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string().min(1),
  // Accept both absolute URLs (uploads) and local paths (e.g. /products/foo.jpg).
  image_url: z.string().min(1).optional(),
  brand: z.string().optional(),
  compare_at_price: z.number().nonnegative().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
