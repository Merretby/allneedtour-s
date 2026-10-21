import { createHash } from 'node:crypto';
import webpush from 'web-push';
import type { PushSubscription } from 'web-push';
import { supabase } from '../../db/client.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

const BUCKET = 'push-subscriptions';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

let configured = false;
let bucketPromise: Promise<void> | null = null;

export function isPushEnabled(): boolean {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
}

function configure(): boolean {
  if (configured) return true;
  if (!isPushEnabled()) return false;

  try {
    webpush.setVapidDetails(
      env.VAPID_SUBJECT,
      env.VAPID_PUBLIC_KEY as string,
      env.VAPID_PRIVATE_KEY as string
    );
    configured = true;
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Invalid VAPID configuration');
    return false;
  }
}

async function initBucket(): Promise<void> {
  const { error } = await supabase.storage.getBucket(BUCKET);
  if (!error) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: false,
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw createError;
  }
}

function ensureBucket(): Promise<void> {
  if (!bucketPromise) {
    bucketPromise = initBucket().catch((error) => {
      bucketPromise = null;
      throw error;
    });
  }
  return bucketPromise;
}

function subscriptionPath(userId: string, endpoint: string): string {
  const hash = createHash('sha256').update(endpoint).digest('hex').slice(0, 48);
  return `${userId}/${hash}.json`;
}

export async function saveSubscription(
  userId: string,
  subscription: PushSubscription
): Promise<void> {
  await ensureBucket();

  const payload: PushSubscription = {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: subscription.keys,
  };

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(subscriptionPath(userId, subscription.endpoint), JSON.stringify(payload), {
      contentType: 'application/json',
      cacheControl: '0',
      upsert: true,
    });

  if (error) throw error;
}

export async function removeSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  await ensureBucket();

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([subscriptionPath(userId, endpoint)]);

  if (error && !/not found/i.test(error.message)) {
    throw error;
  }
}

export async function getSubscriptions(userId: string): Promise<PushSubscription[]> {
  await ensureBucket();

  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(userId, { limit: 100 });

  if (error) {
    logger.warn({ err: error, userId }, 'Could not list push subscriptions');
    return [];
  }

  const subscriptions = await Promise.all(
    (files ?? [])
      .filter((file) => file.name.endsWith('.json'))
      .map(async (file) => {
        const { data, error: downloadError } = await supabase.storage
          .from(BUCKET)
          .download(`${userId}/${file.name}`);

        if (downloadError || !data) return null;

        try {
          const parsed = JSON.parse(await data.text()) as PushSubscription;
          if (!parsed.endpoint || !parsed.keys?.p256dh || !parsed.keys?.auth) {
            return null;
          }
          return parsed;
        } catch {
          return null;
        }
      })
  );

  return subscriptions.filter((sub): sub is PushSubscription => sub !== null);
}

export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!configure()) return { sent: 0, failed: 0 };

  const subscriptions = await getSubscriptions(userId);
  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(payload), {
          TTL: 3600,
        });
        sent += 1;
      } catch (error) {
        failed += 1;
        const statusCode = (error as { statusCode?: number }).statusCode;

        if (statusCode === 404 || statusCode === 410) {
          await removeSubscription(userId, subscription.endpoint).catch(() => {});
        } else {
          logger.warn({ err: error, userId }, 'Web push delivery failed');
        }
      }
    })
  );

  return { sent, failed };
}

export async function sendPushToAdmins(
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!configure()) return { sent: 0, failed: 0 };

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin');

  if (error) {
    logger.warn({ err: error }, 'Could not list admins for push notification');
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.all(
    (data ?? []).map((admin) => sendPushToUser(admin.id, payload))
  );

  return results.reduce(
    (total, result) => ({
      sent: total.sent + result.sent,
      failed: total.failed + result.failed,
    }),
    { sent: 0, failed: 0 }
  );
}
