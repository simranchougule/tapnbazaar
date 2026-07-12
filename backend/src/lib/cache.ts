// Lightweight in-memory TTL cache for hot, read-heavy endpoints
// (trending products, admin stats, category list) that don't need
// per-request freshness.
//
// IMPORTANT — this is process-local. If you ever run more than one
// backend instance/replica behind a load balancer, each instance has its
// own independent cache — you won't get consistent hit rates or shared
// invalidation across instances, and a write on one instance won't
// invalidate the cache on another. That's fine for a single-instance
// deployment; if you scale horizontally, replace this with Redis (the
// `get`/`set`/`invalidate` call sites below won't need to change shape,
// just the implementation underneath).

interface CacheEntry<T> {
  value:     T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value as T
}

export function setCached<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export function invalidateCache(key: string): void {
  store.delete(key)
}

export function invalidateCachePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

// Convenience wrapper: returns the cached value if present, otherwise
// runs `fn`, caches the result, and returns it.
export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const cached = getCached<T>(key)
  if (cached !== undefined) return cached
  const value = await fn()
  setCached(key, value, ttlMs)
  return value
}