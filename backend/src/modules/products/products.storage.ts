import { randomUUID } from 'node:crypto';
import { supabase } from '../../db/client.js';
import { AppError } from '../../common/errors/AppError.js';

const BUCKET = 'product-images';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function ensureBucket(): Promise<void> {
  const { error: getError } = await supabase.storage.getBucket(BUCKET);
  if (!getError) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
  });

  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

export async function uploadProductImage(
  buffer: Buffer,
  mimetype: string
): Promise<string> {
  const extension = EXTENSIONS[mimetype.toLowerCase()];
  if (!extension) {
    throw AppError.badRequest(
      'Format d’image non supporté. Utilisez JPG, PNG, WebP, GIF ou AVIF.'
    );
  }

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw AppError.badRequest('Image trop volumineuse (5 Mo maximum).');
  }

  await ensureBucket();

  const path = `products/${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mimetype,
    cacheControl: '31536000',
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
