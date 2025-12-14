/**
 * Simple rate limiting implementation using in-memory store
 * 
 * For production with multiple instances, consider using:
 * - Upstash Redis (@upstash/ratelimit)
 * - Vercel KV
 * - Redis
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}, 10 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number
  
  /**
   * Time window in seconds
   */
  windowSeconds: number
  
  /**
   * Custom identifier (defaults to IP address)
   */
  identifier?: string
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean
  
  /**
   * Number of requests remaining in the window
   */
  remaining: number
  
  /**
   * Time until the rate limit resets (seconds)
   */
  resetIn: number
  
  /**
   * Total requests allowed in the window
   */
  limit: number
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier for the requester (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const key = `${identifier}:${config.maxRequests}:${config.windowSeconds}`
  
  const entry = rateLimitStore.get(key)
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired
    const resetTime = now + windowMs
    rateLimitStore.set(key, { count: 1, resetTime })
    
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
      limit: config.maxRequests,
    }
  }
  
  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)
  
  const resetIn = Math.ceil((entry.resetTime - now) / 1000)
  const remaining = Math.max(0, config.maxRequests - entry.count)
  const success = entry.count <= config.maxRequests
  
  return {
    success,
    remaining,
    resetIn,
    limit: config.maxRequests,
  }
}

/**
 * Get rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetIn.toString(),
  }
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  /** Strict: 10 requests per minute */
  STRICT: { maxRequests: 10, windowSeconds: 60 },
  
  /** Standard: 30 requests per minute */
  STANDARD: { maxRequests: 30, windowSeconds: 60 },
  
  /** Lenient: 100 requests per minute */
  LENIENT: { maxRequests: 100, windowSeconds: 60 },
  
  /** Auth: 5 login attempts per 15 minutes */
  AUTH: { maxRequests: 5, windowSeconds: 15 * 60 },
  
  /** API: 1000 requests per hour */
  API: { maxRequests: 1000, windowSeconds: 60 * 60 },
}

/**
 * Middleware helper to get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from Vercel/Netlify headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }
  
  // Fallback to user agent as identifier (not ideal but better than nothing)
  return request.headers.get('user-agent') || 'unknown'
}
