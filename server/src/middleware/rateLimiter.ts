import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitInfo>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 120; // 120 requests per IP per minute

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  // Extract client IP address
  const ip = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
  const now = Date.now();

  const clientInfo = ipRequestMap.get(ip);

  if (!clientInfo) {
    // New IP entry
    ipRequestMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
    return next();
  }

  if (now > clientInfo.resetTime) {
    // Reset window
    clientInfo.count = 1;
    clientInfo.resetTime = now + WINDOW_MS;
    return next();
  }

  clientInfo.count++;

  // Check limits
  if (clientInfo.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests. Please try again in a minute.',
      retryAfter: Math.round((clientInfo.resetTime - now) / 1000)
    });
  }

  next();
}

// Clean up stale IP records every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of ipRequestMap.entries()) {
    if (now > info.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, 10 * 60 * 1000);
