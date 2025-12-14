# Deployment Guide

Complete guide for deploying Go To Sleep Clock to production.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Supabase account (for online mode)
- Hosting platform account (Vercel or Netlify recommended)

## Step 1: Prepare Supabase

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: "go-to-sleep-clock"
   - Database Password: (generate strong password)
   - Region: Choose closest to users
4. Wait for project to initialize (~2 minutes)

### 1.2 Run Database Migration

1. In Supabase dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into SQL editor
5. Click "Run"
6. Verify tables created in "Table Editor"

### 1.3 Enable Realtime

1. Go to "Database" → "Replication"
2. Enable replication for:
   - `settings` table
   - `daily_state` table (optional)
3. Save changes

### 1.4 Get API Credentials

1. Go to "Settings" → "API"
2. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` `public` key

Keep these safe - you'll need them for deployment.

## Step 2: Deploy to Vercel (Recommended)

### 2.1 Push to Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-git-repo-url>
git push -u origin main
```

### 2.2 Import to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 2.3 Add Environment Variables

In Vercel project settings → "Environment Variables", add:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Optional:
```
NEXT_PUBLIC_TIMEZONE=Australia/Brisbane
```

### 2.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Vercel provides a production URL (e.g., `your-app.vercel.app`)

### 2.5 Custom Domain (Optional)

1. In Vercel project → "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning

## Step 3: Deploy to Netlify (Alternative)

### 3.1 Push to Git

Same as Step 2.1 above.

### 3.2 Import to Netlify

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect to Git provider
4. Select repository

### 3.3 Configure Build

- Build command: `npm run build`
- Publish directory: `.next`
- Functions directory: (leave empty)

### 3.4 Add Environment Variables

In Netlify site settings → "Environment variables":

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3.5 Deploy

1. Click "Deploy site"
2. Wait for build
3. Netlify provides a production URL

### 3.6 Custom Domain (Optional)

1. Site settings → "Domain management"
2. Add custom domain
3. Configure DNS

## Step 4: Generate App Icons

The app needs proper icons for PWA installation.

### Option 1: Use Online Generator

1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload a base image:
   - Suggested: Purple/blue gradient with moon icon
   - Minimum 512x512px
   - PNG format
3. Download generated icons
4. Replace `public/icon-192.png` and `public/icon-512.png`
5. Commit and push:
```bash
git add public/*.png
git commit -m "Add app icons"
git push
```

### Option 2: Create Manually

Create two PNG files:
- `icon-192.png`: 192x192px
- `icon-512.png`: 512x512px

Design suggestions:
- Background: Purple/blue gradient (#7c3aed → #3b82f6)
- Icon: White moon or sleep emoji
- Keep it simple and recognizable

## Step 5: Test Production Deployment

### 5.1 iPad Test

1. Open Safari on iPad
2. Navigate to production URL
3. Add to Home Screen
4. Test all features:
   - Setup flow
   - PIN entry
   - Mode screens
   - Chores/books flow
   - Settings sync
   - Audio chimes
   - Offline functionality

### 5.2 Multi-Device Test

1. Set up on iPad
2. Install on parent's phone (same URL)
3. Sign in with same account
4. Make changes on phone
5. Verify changes appear on iPad within seconds

### 5.3 Offline Test

1. Enable airplane mode on iPad
2. Verify app continues functioning
3. Make changes (complete chores, etc.)
4. Re-enable network
5. Verify changes sync

## Step 6: Configure iPad for Production Use

Follow the setup guide in `/instructions` or README.md:

1. Add to Home Screen
2. Set Auto-Lock to Never
3. Enable Guided Access
4. Adjust brightness
5. Keep iPad plugged in

## Step 7: Monitoring & Maintenance

### Vercel

Monitor deployment:
- Dashboard shows analytics
- View function logs
- Real-time error tracking

### Netlify

Monitor deployment:
- Analytics dashboard
- Function logs
- Deploy previews for branches

### Supabase

Monitor database:
- Dashboard → "Database" for stats
- "Logs" for query performance
- "Storage" if using image uploads

## Troubleshooting Deployment

### Build Fails

**Error: Missing dependencies**
```bash
npm install
npm run build
```
Fix any TypeScript errors locally before deploying.

**Error: Environment variables not found**
- Check variables are set in hosting platform
- Ensure names match exactly (case-sensitive)
- Prefix with `NEXT_PUBLIC_` for client-side access

### PWA Not Installing

**iOS: "Add to Home Screen" not working**
- Must use Safari (not Chrome/Firefox)
- Ensure manifest.json is accessible
- Check icons exist and are valid PNG

**Service Worker Not Registering**
- Verify HTTPS (required for PWA)
- Check next-pwa configuration in next.config.js
- Clear browser cache and retry

### Realtime Not Working

**Settings not syncing**
- Verify Realtime enabled in Supabase
- Check browser console for WebSocket errors
- Ensure `settings` table has replication enabled
- Test fallback polling (60s interval)

### Database Connection Errors

**RLS Policy Errors**
- Verify migration ran successfully
- Check user is authenticated
- Test policies in Supabase SQL editor

## Rolling Back

### Vercel
1. Dashboard → "Deployments"
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Netlify
1. Site settings → "Deploys"
2. Find previous deploy
3. Click "Publish deploy"

## Security Checklist

- [ ] Supabase RLS policies enabled
- [ ] Environment variables stored securely (not in code)
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] PIN hashing uses bcrypt (10+ rounds)
- [ ] Auth configured with strong password requirements
- [ ] Database password is strong and private
- [ ] API keys are `anon` keys (not `service_role`)

## Performance Optimization

### Enable Compression
Both Vercel and Netlify handle this automatically.

### CDN Configuration
Also automatic with both platforms.

### Database Indexes
Already included in migration for common queries:
- `profiles.user_id`
- `daily_state.profile_id, date`

### Caching Strategy
Service worker caches:
- Static assets
- App shell
- API responses (with revalidation)

## Scaling Considerations

### Database
Supabase free tier:
- 500MB database
- 2GB bandwidth
- 50MB storage

For larger usage, upgrade to paid plan.

### Hosting
Vercel free tier:
- 100GB bandwidth
- Unlimited requests

Netlify free tier:
- 100GB bandwidth

For multiple families, should be fine on free tier.

## Backup Strategy

### Supabase Database Backup

1. Go to Supabase dashboard → "Database" → "Backups"
2. Enable automatic daily backups (paid plans only)
3. For free tier, manually export:
   - SQL Editor → Run: `pg_dump`
   - Or use Supabase CLI

### Disaster Recovery

1. Re-run migration SQL
2. Restore from backup if available
3. Users' local IndexedDB data allows continuation

## Next Steps

- Set up monitoring/alerts
- Configure custom domain
- Add analytics (optional)
- Set up continuous deployment
- Create staging environment

---

Questions? Open an issue on GitHub.

