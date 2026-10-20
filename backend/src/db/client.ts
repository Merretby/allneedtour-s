import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

if (
  env.SUPABASE_SERVICE_KEY.startsWith('sb_publishable_') ||
  env.SUPABASE_SERVICE_KEY === 'your-service-key'
) {
  console.warn(
    '⚠️  SUPABASE_SERVICE_KEY is a publishable/placeholder key. ' +
      'Use the secret key (sb_secret_...) from Supabase → Project Settings → API; ' +
      'writes and protected reads will fail otherwise.'
  );
}
