const bucket = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const prev = bucket.get(key);
  if (!prev || prev.reset < now) {
    bucket.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (prev.count >= limit) return false;
  prev.count += 1;
  return true;
}
