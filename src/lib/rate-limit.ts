interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 5; // Allow max 5 submissions per minute per IP

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = tracker.get(ip);

  if (!record) {
    tracker.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return false;
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + WINDOW_MS;
    return false;
  }

  record.count += 1;
  return record.count > MAX_REQUESTS;
}
