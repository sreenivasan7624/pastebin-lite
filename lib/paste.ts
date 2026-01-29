import { z } from 'zod';
import { kvGet, kvSet, kvSetEx } from './kv';
import { getCurrentTime } from './utils';

/**
 * Paste data stored in KV
 */
export interface PasteData {
  content: string;
  ttl_seconds?: number;
  max_views?: number;
  created_at: number;
  expires_at?: number;
  views: number;
}

/**
 * Response for creating a paste
 */
export interface PasteResponse {
  id: string;
  url: string;
}

/**
 * Response for fetching a paste
 */
export interface PasteGetResponse {
  content: string;
  remaining_views: number | null;
  expires_at: string | null;
}

/**
 * Schema for validating paste creation requests
 */
export const createPasteSchema = z.object({
  content: z.string().min(1, 'Content is required and must be non-empty'),
  ttl_seconds: z.number().int().min(1).optional(),
  max_views: z.number().int().min(1).optional(),
});

export type CreatePasteInput = z.infer<typeof createPasteSchema>;

/**
 * Check if a paste is expired
 */
export async function isPasteExpired(paste: PasteData): Promise<boolean> {
  if (!paste.expires_at) {
    return false;
  }
  
  const now = await getCurrentTime();
  return now >= paste.expires_at;
}

/**
 * Check if a paste has exceeded its view limit
 */
export function hasExceededViewLimit(paste: PasteData): boolean {
  if (!paste.max_views) {
    return false;
  }
  
  return paste.views >= paste.max_views;
}

/**
 * Check if a paste is available (not expired and not exceeded view limit)
 */
export async function isPasteAvailable(paste: PasteData): Promise<boolean> {
  if (await isPasteExpired(paste)) {
    return false;
  }
  
  if (hasExceededViewLimit(paste)) {
    return false;
  }
  
  return true;
}

/**
 * Get remaining views for a paste
 */
export function getRemainingViews(paste: PasteData): number | null {
  if (!paste.max_views) {
    return null;
  }
  
  const remaining = paste.max_views - paste.views;
  return Math.max(0, remaining);
}

/**
 * Fetch a paste from KV by ID
 */
export async function getPaste(id: string): Promise<PasteData | null> {
  const key = `paste:${id}`;

  return kvGet<PasteData>(key);
}

/**
 * Store a paste in KV
 */
export async function storePaste(id: string, paste: PasteData, ttlSeconds?: number): Promise<void> {
  const key = `paste:${id}`;

  if (ttlSeconds) {
    // Set with TTL for automatic cleanup
    await kvSetEx(key, ttlSeconds, paste);
  } else {
    await kvSet(key, paste);
  }
}

/**
 * Increment view count and update the paste
 * Returns the updated paste data
 * Note: This is a read-modify-write operation. For serverless with low concurrency,
 * this should be sufficient. For higher concurrency, consider using Redis transactions.
 */
export async function incrementViewCount(id: string): Promise<PasteData | null> {
  const key = `paste:${id}`;
  
  // Fetch current paste
  const paste = await getPaste(id);
  if (!paste) {
    return null;
  }
  
  // Increment view count
  paste.views = paste.views + 1;
  
  // Calculate TTL using current time (respects TEST_MODE)
  const currentTime = await getCurrentTime();
  const ttl = paste.expires_at ? Math.ceil((paste.expires_at - currentTime) / 1000) : undefined;
  
  // Update in KV
  if (ttl && ttl > 0) {
    await kvSetEx(key, ttl, paste);
  } else {
    await kvSet(key, paste);
  }
  
  return paste;
}
