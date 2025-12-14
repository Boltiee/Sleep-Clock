# Security Headers Documentation

## Overview

Security headers have been configured in `next.config.js` to protect against common web vulnerabilities.

## Configured Headers

### 1. X-DNS-Prefetch-Control

**Value**: `on`

**Purpose**: Controls DNS prefetching to improve performance while maintaining privacy.

**Security Impact**: Low (performance optimization)

### 2. Strict-Transport-Security (HSTS)

**Value**: `max-age=63072000; includeSubDomains; preload`

**Purpose**: Forces browsers to always use HTTPS connections.

**Security Impact**: HIGH ⚠️

**Details**:
- `max-age=63072000`: 2 years in seconds
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser preload lists

**Note**: Only enable after confirming HTTPS works everywhere!

### 3. X-Frame-Options

**Value**: `SAMEORIGIN`

**Purpose**: Prevents clickjacking attacks by controlling iframe embedding.

**Security Impact**: HIGH ⚠️

**Options**:
- `DENY`: Never allow framing
- `SAMEORIGIN`: Only allow framing from same origin
- `ALLOW-FROM https://example.com`: Allow specific origin

**Current**: Allows embedding from same origin (needed for PWA)

### 4. X-Content-Type-Options

**Value**: `nosniff`

**Purpose**: Prevents MIME type sniffing attacks.

**Security Impact**: MEDIUM

**Details**: Forces browser to respect declared Content-Type header.

### 5. X-XSS-Protection

**Value**: `1; mode=block`

**Purpose**: Enables XSS filter built into most browsers.

**Security Impact**: MEDIUM (legacy browsers)

**Note**: Modern browsers use CSP instead, but this provides fallback protection.

### 6. Referrer-Policy

**Value**: `strict-origin-when-cross-origin`

**Purpose**: Controls how much referrer information is shared.

**Security Impact**: MEDIUM (privacy)

**Details**:
- Same origin: Full URL
- Cross-origin (HTTPS→HTTPS): Origin only
- Cross-origin (HTTPS→HTTP): No referrer

### 7. Permissions-Policy

**Value**: `camera=(), microphone=(), geolocation=(), interest-cohort=()`

**Purpose**: Disables unnecessary browser features.

**Security Impact**: MEDIUM (privacy/security)

**Disabled Features**:
- `camera=()`: No camera access
- `microphone=()`: No microphone access
- `geolocation=()`: No location tracking
- `interest-cohort=()`: Opt out of FLoC/tracking

## Content Security Policy (CSP)

### Not Currently Implemented

CSP is not yet configured because:
1. Requires careful testing with Supabase, Sentry, Vercel
2. Can break functionality if misconfigured
3. Needs inline script/style allowances for Next.js

### Recommended CSP (Future)

```javascript
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://*.sentry.io",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sentry.io",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}
```

### Testing CSP

1. Add CSP header in report-only mode:
   ```javascript
   {
     key: 'Content-Security-Policy-Report-Only',
     value: '...'
   }
   ```

2. Monitor violations in browser console

3. Adjust policy as needed

4. Switch to enforcement mode when ready

## Verification

### Check Headers Online

1. **Security Headers**: https://securityheaders.com/
   - Test your deployed site
   - Get a security grade (A+ is best)
   - See recommendations

2. **Mozilla Observatory**: https://observatory.mozilla.org/
   - Comprehensive security scan
   - Includes TLS, headers, cookies
   - Provides detailed recommendations

### Check Headers Locally

```bash
# Check all headers
curl -I https://your-app.vercel.app

# Check specific header
curl -I https://your-app.vercel.app | grep X-Frame-Options

# Pretty print with jq
curl -s -D- https://your-app.vercel.app | grep -E "^[A-Z].*:" | jq -R 'split(": ") | {(.[0]): .[1]}'
```

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Refresh page
4. Click on document request
5. View "Response Headers"

## Common Issues

### Issue: HSTS Breaking Local Development

**Problem**: HSTS forces HTTPS even on localhost

**Solution**: Use different domains for dev/prod:
```javascript
const securityHeaders = process.env.NODE_ENV === 'production' ? [
  // ... include HSTS
] : [
  // ... exclude HSTS
]
```

### Issue: X-Frame-Options Breaking Embedding

**Problem**: Can't embed app in iframe

**Solution**: Change to `ALLOW-FROM` or remove header:
```javascript
{
  key: 'X-Frame-Options',
  value: 'ALLOW-FROM https://trusted-site.com'
}
```

### Issue: CSP Breaking Inline Scripts

**Problem**: Next.js uses inline scripts that CSP blocks

**Solution**: Use nonces or hashes:
```javascript
// Use nonce
script-src 'self' 'nonce-{RANDOM_VALUE}'

// Or use hash
script-src 'self' 'sha256-{HASH_OF_SCRIPT}'
```

## Security Best Practices

### ✅ Do

1. Test headers on staging before production
2. Use HTTPS everywhere (Vercel does this automatically)
3. Keep dependencies updated (`npm audit fix`)
4. Monitor security alerts (GitHub Dependabot)
5. Use environment variables for secrets
6. Enable 2FA on all accounts (GitHub, Vercel, Supabase)
7. Regularly review access logs
8. Implement rate limiting (already done ✅)
9. Use strong passwords and PINs
10. Back up data regularly (already done ✅)

### ❌ Don't

1. Don't commit secrets to git
2. Don't use `unsafe-inline` in CSP unless necessary
3. Don't disable security headers without good reason
4. Don't ignore security warnings
5. Don't use HTTP (always HTTPS in production)
6. Don't expose database credentials
7. Don't skip security updates
8. Don't trust user input (always validate/sanitize)

## Security Checklist

### Before Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS enabled (Vercel does this automatically)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Supabase handles this)
- [ ] XSS prevention (React handles this mostly)
- [ ] CSRF protection (Next.js handles this)
- [ ] Dependency audit clean (`npm audit`)
- [ ] No sensitive data in logs
- [ ] Error messages don't leak info

### After Deployment

- [ ] Test with securityheaders.com
- [ ] Test with Observatory Mozilla
- [ ] Verify HTTPS works
- [ ] Check certificate is valid
- [ ] Test rate limiting works
- [ ] Review Sentry errors
- [ ] Monitor failed login attempts
- [ ] Review access logs weekly

## Additional Security Layers

### 1. Supabase Row Level Security (RLS)

Already configured ✅

- Users can only access their own data
- Enforced at database level
- Can't be bypassed from client

### 2. API Rate Limiting

Already configured ✅

- 30 requests/min for API
- 5 requests/15min for auth
- Prevents brute force attacks

### 3. PIN Protection

Already configured ✅

- bcrypt hashing (10 rounds)
- No plaintext storage
- Constant-time comparison

### 4. Sentry Error Monitoring

Already configured ✅

- Tracks all errors
- Alerts on unusual activity
- Performance monitoring

### 5. Vercel DDoS Protection

Included automatically

- Edge network protection
- Automatic scaling
- Rate limiting at edge

## Future Security Enhancements

### High Priority

1. [ ] Implement full CSP
2. [ ] Add CSRF tokens for forms
3. [ ] Implement session management
4. [ ] Add audit logging
5. [ ] Set up security monitoring alerts

### Medium Priority

1. [ ] Add brute force protection
2. [ ] Implement IP whitelisting for admin
3. [ ] Add two-factor authentication
4. [ ] Implement account recovery flow
5. [ ] Add security question backup

### Low Priority

1. [ ] Penetration testing
2. [ ] Security audit by third party
3. [ ] Implement SOC 2 compliance
4. [ ] Add data encryption at rest
5. [ ] Implement zero-trust architecture

## Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Security Headers**: https://securityheaders.com/
- **Mozilla Observatory**: https://observatory.mozilla.org/
- **Next.js Security**: https://nextjs.org/docs/advanced-features/security-headers
- **Vercel Security**: https://vercel.com/docs/security
- **Supabase Security**: https://supabase.com/docs/guides/platform/going-into-prod#security
