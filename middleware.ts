import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getRateLimitHeaders, getClientIdentifier, RateLimitPresets } from './lib/rate-limit'

export function middleware(request: NextRequest) {
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const identifier = getClientIdentifier(request)
    
    // Different limits for different endpoints
    let rateLimitConfig = RateLimitPresets.STANDARD
    
    // Stricter limits for auth endpoints
    if (request.nextUrl.pathname.includes('/auth')) {
      rateLimitConfig = RateLimitPresets.AUTH
    }
    
    // Check rate limit
    const rateLimitResult = checkRateLimit(identifier, rateLimitConfig)
    
    if (!rateLimitResult.success) {
      // Rate limit exceeded
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${rateLimitResult.resetIn} seconds.`,
          retryAfter: rateLimitResult.resetIn,
        },
        {
          status: 429,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            'Retry-After': rateLimitResult.resetIn.toString(),
          },
        }
      )
    }
    
    // Request allowed - add rate limit headers
    const response = NextResponse.next()
    const headers = getRateLimitHeaders(rateLimitResult)
    
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
