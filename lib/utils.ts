import { headers } from 'next/headers';
import { getKV } from './kv';

const ALPHANUMERIC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ID_LENGTH = 7; // 7 characters gives good collision resistance

/**
 * Generate a random alphanumeric string of specified length
 */
function generateRandomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length));
  }
  return result;
}

/**
 * Get current time in milliseconds, respecting TEST_MODE
 * If TEST_MODE=1 and x-test-now-ms header is present, use that value
 * Otherwise use system time
 */
export async function getCurrentTime(): Promise<number> {
  const testMode = process.env.TEST_MODE === '1';
  
  if (testMode) {
    const headersList = await headers();
    const testTimeHeader = headersList.get('x-test-now-ms');
    if (testTimeHeader) {
      const testTime = parseInt(testTimeHeader, 10);
      if (!isNaN(testTime)) {
        return testTime;
      }
    }
  }
  
  return Date.now();
}

/**
 * Calculate expires_at timestamp from TTL in seconds
 */
export function calculateExpiresAt(ttlSeconds: number, currentTime: number): number {
  return currentTime + (ttlSeconds * 1000);
}

/**
 * Generate a unique paste ID
 * Checks KV for uniqueness and retries on collision
 */
export async function generatePasteId(): Promise<string> {
  const kv = getKV();
  const maxRetries = 10;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const id = generateRandomString(ID_LENGTH);
    const key = `paste:${id}`;
    
    // Check if this ID already exists
    const exists = await kv.exists(key);
    if (!exists) {
      return id;
    }
  }
  
  // If we've exhausted retries, throw an error
  throw new Error('Failed to generate unique paste ID after multiple attempts');
}

/**
 * Get base URL for the application
 * Uses VERCEL_URL in production, localhost in development
 */
export function getBaseUrl(): string {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  return 'http://localhost:3000';
}
