import { kv } from '@vercel/kv';

/**
 * Get the KV client instance
 * Throws if KV is not properly configured
 */
export function getKV() {
  if (!kv) {
    throw new Error('KV client not configured. Please set KV_REDIS_URL, KV_REDIS_REST_URL, and KV_REDIS_REST_TOKEN environment variables.');
  }
  return kv;
}

/**
 * Check if KV connection is available
 */
export async function checkKVConnection(): Promise<boolean> {
  try {
    const client = getKV();
    // Try a simple ping operation
    await client.ping();
    return true;
  } catch (error) {
    return false;
  }
}
