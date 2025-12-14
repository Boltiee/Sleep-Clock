# Rate Limiting Documentation

## Overview

Rate limiting has been implemented to protect the API from abuse and ensure fair usage.

## Implementation

The app uses an in-memory rate limiting system that tracks requests per IP address.

### Files Created

- `lib/rate-limit.ts` - Rate limiting logic
- `middleware.ts` - Next.js middleware to apply rate limiting

## Rate Limit Configurations

### Presets

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| STRICT | 10 requests | 1 minute | Critical endpoints |
| STANDARD | 30 requests | 1 minute | General API endpoints |
| LENIENT | 100 requests | 1 minute | Public endpoints |
| AUTH | 5 requests | 15 minutes | Login/signup |
| API | 1000 requests | 1 hour | High-volume endpoints |

### Current Configuration

- **API Routes**: 30 requests per minute (STANDARD)
- **Auth Routes**: 5 requests per 15 minutes (AUTH)
- **Health Check**: No rate limit

## Response Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 60
```

## Rate Limit Exceeded Response

When rate limit is exceeded, the API returns:

**Status**: 429 Too Many Requests

**Response**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again in 45 seconds.",
  "retryAfter": 45
}
```

**Headers**:
```
Retry-After: 45
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 45
```

## Testing Rate Limits

### Test Script

```bash
#!/bin/bash
# Test rate limiting

API_URL="http://localhost:3000/api/health"

echo "Testing rate limiting..."
for i in {1..35}; do
    echo "Request $i:"
    curl -s -w "\nStatus: %{http_code}\n" \
         -H "Content-Type: application/json" \
         "$API_URL" | head -n 5
    sleep 0.5
done
```

### Expected Behavior

1. First 30 requests: Status 200
2. Remaining headers decrease with each request
3. Request 31+: Status 429
4. After 60 seconds: Counter resets

## Limitations of Current Implementation

### In-Memory Storage

The current implementation uses in-memory storage which:

✅ **Pros**:
- No external dependencies
- Fast
- Free
- Simple to implement

❌ **Cons**:
- Resets on server restart
- Doesn't work across multiple server instances
- Limited memory capacity

### When to Upgrade

Upgrade to Redis-based rate limiting when:
- You have multiple server instances
- You need persistent rate limits
- You're seeing memory issues
- You need more sophisticated limits (sliding windows, etc.)

## Upgrading to Redis (Upstash)

### Step 1: Install Dependencies

```bash
npm install @upstash/ratelimit @upstash/redis
```

### Step 2: Sign Up for Upstash

1. Go to https://console.upstash.com/
2. Create a Redis database
3. Copy REST URL and token

### Step 3: Add Environment Variables

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

### Step 4: Update Rate Limit Implementation

Replace `lib/rate-limit.ts` with:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '1 m'),
  analytics: true,
})

export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier)
  
  return {
    success,
    remaining,
    resetIn: Math.ceil((reset - Date.now()) / 1000),
    limit,
  }
}
```

### Step 5: Update Middleware

```typescript
// middleware.ts
const rateLimitResult = await checkRateLimit(identifier)
```

### Cost

Upstash Free Tier:
- 10,000 requests/day
- 256 MB storage
- Perfect for 10-50 users

## Custom Rate Limits

### Per-User Rate Limiting

```typescript
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const userId = await getUserId(request)
  const identifier = `user:${userId}`
  
  const rateLimit = checkRateLimit(identifier, {
    maxRequests: 100,
    windowSeconds: 3600, // 1 hour
  })
  
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  // Process request...
}
```

### Per-Endpoint Rate Limiting

```typescript
// lib/rate-limits.ts
export const RATE_LIMITS = {
  '/api/settings': { maxRequests: 10, windowSeconds: 60 },
  '/api/profiles': { maxRequests: 5, windowSeconds: 60 },
  '/api/sync': { maxRequests: 30, windowSeconds: 60 },
}
```

## Monitoring Rate Limits

### Log Rate Limit Hits

Add to `middleware.ts`:

```typescript
if (!rateLimitResult.success) {
  console.log(`Rate limit exceeded for ${identifier} on ${request.nextUrl.pathname}`)
  
  // Send to Sentry
  Sentry.captureMessage('Rate limit exceeded', {
    level: 'warning',
    extra: {
      identifier,
      path: request.nextUrl.pathname,
      remaining: rateLimitResult.remaining,
    },
  })
}
```

### Track Rate Limit Analytics

```typescript
// Log to analytics
await trackEvent('rate_limit_exceeded', {
  path: request.nextUrl.pathname,
  identifier: identifier.substring(0, 10), // Don't log full IP
  resetIn: rateLimitResult.resetIn,
})
```

## Best Practices

1. ✅ Use stricter limits for auth endpoints
2. ✅ Include rate limit headers in responses
3. ✅ Provide clear error messages
4. ✅ Use `Retry-After` header
5. ✅ Log rate limit violations
6. ✅ Consider user experience (don't be too strict)
7. ❌ Don't rate limit health checks
8. ❌ Don't log full IP addresses (GDPR)

## Whitelist/Blacklist

### Whitelist Trusted IPs

```typescript
const WHITELISTED_IPS = ['127.0.0.1', '::1']

if (WHITELISTED_IPS.includes(identifier)) {
  return NextResponse.next() // Skip rate limiting
}
```

### Blacklist Abusive IPs

```typescript
const BLACKLISTED_IPS = new Set(['1.2.3.4'])

if (BLACKLISTED_IPS.has(identifier)) {
  return NextResponse.json(
    { error: 'Access denied' },
    { status: 403 }
  )
}
```

## Troubleshooting

### Rate Limit Too Strict

Adjust in `middleware.ts`:
```typescript
const rateLimitConfig = {
  maxRequests: 100, // Increase
  windowSeconds: 60,
}
```

### Rate Limit Not Working

1. Check middleware is running:
   ```typescript
   console.log('Rate limit check for:', identifier)
   ```

2. Verify matcher in `middleware.ts`:
   ```typescript
   export const config = {
     matcher: '/api/:path*',
   }
   ```

3. Check if route is excluded

### Memory Issues

Monitor memory usage:
```bash
# Check Node.js memory
node --inspect your-app.js

# Or upgrade to Redis-based rate limiting
```

## Security Considerations

1. **IP Spoofing**: The current implementation uses `x-forwarded-for` which can be spoofed. Vercel/Netlify handle this securely.

2. **DDoS Protection**: For serious DDoS attacks, use Cloudflare or Vercel's DDoS protection.

3. **Rate Limit Bypass**: Don't rely solely on rate limiting for security. Always validate and sanitize inputs.

## Future Enhancements

- [ ] Sliding window rate limiting
- [ ] Different limits per user tier
- [ ] Geographic-based rate limiting
- [ ] Automatic IP blacklisting
- [ ] Rate limit dashboard
- [ ] WebSocket rate limiting
- [ ] GraphQL complexity-based rate limiting

## References

- Next.js Middleware: https://nextjs.org/docs/app/building-your-application/routing/middleware
- Upstash Rate Limiting: https://github.com/upstash/ratelimit
- HTTP 429 Status: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429
