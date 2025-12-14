# Sentry Error Monitoring Setup

Sentry has been configured for error tracking in this application.

## Configuration Files

The following files have been created:
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration
- `sentry.edge.config.ts` - Edge runtime Sentry configuration
- `instrumentation.ts` - Next.js instrumentation for Sentry
- Updated `next.config.js` with Sentry webpack plugin

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Required: Get from https://sentry.io after creating a project
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Optional: For source map uploads (production only)
SENTRY_AUTH_TOKEN=your_auth_token_here
SENTRY_ORG=your_organization_slug
SENTRY_PROJECT=your_project_name
```

## Setup Steps

1. **Create a Sentry Account**
   - Go to https://sentry.io
   - Sign up for a free account (5,000 errors/month)

2. **Create a New Project**
   - Click "Projects" → "Create Project"
   - Choose "Next.js" as platform
   - Name it "go-to-sleep-clock"
   - Copy the DSN provided

3. **Add Environment Variables**
   - Add `NEXT_PUBLIC_SENTRY_DSN` to `.env.local`
   - Add to Vercel/Netlify environment variables

4. **Test Error Tracking**
   - Run `npm run dev`
   - Trigger an error (e.g., sync failure)
   - Check Sentry dashboard for captured error

5. **Set Up Alerts** (Optional)
   - In Sentry dashboard, go to "Alerts"
   - Create alert rule for "High error volume"
   - Configure email/Slack notifications

## Error Tracking Integration

Errors are automatically captured in:
- **Sync operations** (`lib/sync.ts`)
  - Settings sync failures
  - Daily state sync failures
  - Profile sync failures
  
- **App initialization** (`contexts/AppContext.tsx`)
  - Initial data load failures
  - User context tracking

- **All unhandled errors**
  - Client-side errors
  - Server-side errors
  - Edge runtime errors

## Features Enabled

- ✅ Automatic error capture
- ✅ Source map upload for stack traces
- ✅ User context tracking (profile ID and name)
- ✅ Operation tagging for easy filtering
- ✅ Replay integration for debugging
- ✅ Performance monitoring
- ✅ Vercel Cron monitor integration

## Filtering

The configuration filters out:
- Local development errors (localhost)
- Common browser extension errors
- Non-critical errors (ResizeObserver, etc.)

## Source Maps

Source maps are automatically uploaded to Sentry in production builds when `SENTRY_AUTH_TOKEN` is configured. This provides detailed stack traces for debugging.

## Cost

- **Free tier**: 5,000 errors/month
- **Team tier**: $26/month for 50,000 errors/month

For 10-50 users, the free tier should be more than sufficient.

## Next Steps

1. Add Sentry DSN to environment variables
2. Deploy to production
3. Monitor errors in Sentry dashboard
4. Set up alert rules for critical errors
5. Review errors weekly and fix high-priority issues
