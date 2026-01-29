import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Get (or create) the Redis client instance.
 * Uses the REDIS_URL environment variable provided by the Vercel Redis integration.
 */
function getRedisClient(): Redis {
  const url = process.env.REDIS_URL;

  if (!url) {
    throw new Error('REDIS_URL environment variable is not set. Please configure it in Vercel and .env.local.');
  }

  if (!redisClient) {
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
  }

  return redisClient;
}

/**
 * Check if Redis connection is available.
 */
export async function checkKVConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a key exists.
 */
export async function kvExists(key: string): Promise<boolean> {
  const client = getRedisClient();
  const result = await client.exists(key);
  return result === 1;
}

/**
 * Get a JSON value from Redis and parse it.
 */
export async function kvGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  const raw = await client.get(key);

  if (raw === null) {
    return null;
  }

  return JSON.parse(raw) as T;
}

/**
 * Set a JSON value in Redis.
 */
export async function kvSet(key: string, value: unknown): Promise<void> {
  const client = getRedisClient();
  await client.set(key, JSON.stringify(value));
}

/**
 * Set a JSON value in Redis with TTL in seconds.
 */
export async function kvSetEx(key: string, ttlSeconds: number, value: unknown): Promise<void> {
  const client = getRedisClient();
  await client.setex(key, ttlSeconds, JSON.stringify(value));
}
