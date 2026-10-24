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
  const { data: bucket, error: getError } = await supabase.storage.getBucket(BUCKET);
  if (!getError && bucket) {
    if (!bucket.public || bucket.file_size_limit !== MAX_IMAGE_BYTES) {
      const { error } = await supabase.storage.updateBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_IMAGE_BYTES,
      });
      if (error) throw error;
    }
    return;
  }

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

export async function downloadProductImage(path: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  if (!/^products\/[a-f0-9-]+\.(jpg|png|webp|gif|avif)$/i.test(path)) {
    throw AppError.badRequest('Invalid product image path');
  }

  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) {
    throw AppError.notFound('Product image not found');
  }

  return {
    buffer: Buffer.from(await data.arrayBuffer()),
    contentType: data.type || 'application/octet-stream',
  };
}
