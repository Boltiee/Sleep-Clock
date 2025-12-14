# Scalability Implementation To-Do List

> **Status**: Infrastructure implemented ✅ | Configuration needed ⚠️  
> **Time Estimate**: 2-4 hours total

## 📋 Quick Start Checklist

Use this file to track your progress setting up the production-ready infrastructure.

---

## Phase 1: Local Setup (30 minutes)

### Environment Configuration
- [ ] Copy environment template: `cp .env.local.example .env.local`
- [ ] Open `.env.local` in editor
- [ ] Add your Supabase URL (from Supabase Dashboard → Settings → API)
- [ ] Add your Supabase anon key (from same location)
- [ ] Save the file
- [ ] Test app locally: `npm run dev`
- [ ] Verify app loads at http://localhost:3000

### Run Tests
- [ ] Run unit tests: `npm test`
- [ ] Verify all tests pass (should be 27 passing tests)
- [ ] Run E2E tests: `npm run test:e2e` (optional)
- [ ] Fix any failing tests if needed

### Git Push
- [ ] Review changes: `git status`
- [ ] Commit any remaining changes: `git add . && git commit -m "Complete scalability setup"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify code is on GitHub: https://github.com/Boltiee/Sleep-Clock

---

## Phase 2: Service Signups (15 minutes)

### Vercel (Deployment)
- [ ] Sign up at https://vercel.com (use GitHub login)
- [ ] Click "Add New Project"
- [ ] Import your GitHub repository: `Boltiee/Sleep-Clock`
- [ ] Note: Don't deploy yet - we'll configure environment variables first

### Sentry (Error Monitoring)
- [ ] Sign up at https://sentry.io
- [ ] Click "Create Project"
- [ ] Select "Next.js" as platform
- [ ] Name it: "go-to-sleep-clock"
- [ ] Copy the DSN (looks like: `https://xxx@xxx.ingest.sentry.io/xxx`)
- [ ] Save DSN for later (you'll add it to Vercel)

### UptimeRobot (Monitoring) - Optional
- [ ] Sign up at https://uptimerobot.com
- [ ] Skip for now (we'll add monitor after deployment)

---

## Phase 3: Vercel Configuration (20 minutes)

### Add Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Required:**
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` = `your_supabase_url`
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your_supabase_anon_key`

**Sentry (Recommended):**
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` = `your_sentry_dsn`
- [ ] Add `SENTRY_ORG` = `your-org-slug` (from Sentry settings)
- [ ] Add `SENTRY_PROJECT` = `go-to-sleep-clock`

**Admin Dashboard:**
- [ ] Add `NEXT_PUBLIC_ADMIN_EMAIL` = `your_email@example.com`

**Optional (Advanced):**
- [ ] Add `NEXT_PUBLIC_TIMEZONE` = `Australia/Brisbane` (or your timezone)
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key` (for admin API)

### Deploy
- [ ] Click "Deploy" button in Vercel
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Copy your production URL (e.g., `go-to-sleep-clock.vercel.app`)
- [ ] Open production URL in browser
- [ ] Verify app loads correctly

---

## Phase 4: Supabase Configuration (20 minutes)

### Update Redirect URLs
Go to Supabase Dashboard → Authentication → URL Configuration

- [ ] Add Site URL: `https://your-app.vercel.app`
- [ ] Add Redirect URLs:
  - [ ] `https://your-app.vercel.app/`
  - [ ] `https://your-app.vercel.app/reset-password`
  - [ ] `http://localhost:3000/reset-password` (for local testing)

### Configure Email Templates
Go to Supabase Dashboard → Authentication → Email Templates

- [ ] Open "Confirm signup" template
- [ ] Customize subject line (optional)
- [ ] Save template
- [ ] Open "Reset password" template
- [ ] Verify redirect URL is correct
- [ ] Save template

### Enable Email Confirmation (Optional)
Go to Supabase Dashboard → Authentication → Providers → Email

- [ ] Toggle "Confirm email" ON (recommended for production)
- [ ] Set password strength requirements (minimum 8 characters)
- [ ] Save settings

### Enable Realtime (Should already be enabled)
Go to Supabase Dashboard → Database → Replication

- [ ] Verify `settings` table has replication enabled
- [ ] Verify `daily_state` table has replication enabled (optional)

---

## Phase 5: Testing Production (30 minutes)

### Basic Functionality
- [ ] Visit your production URL
- [ ] Test signup flow (create new account)
- [ ] Check email for verification (if enabled)
- [ ] Create a child profile
- [ ] Set a PIN
- [ ] Test main app features

### Health Check
- [ ] Visit: `https://your-app.vercel.app/api/health`
- [ ] Verify response shows `"status": "healthy"`
- [ ] Verify `"database": "ok"`

### Password Reset Flow
- [ ] Go to sign in page
- [ ] Click "Forgot Password?"
- [ ] Enter your email
- [ ] Check inbox for reset email
- [ ] Click reset link
- [ ] Set new password
- [ ] Verify you can sign in with new password

### Admin Dashboard
- [ ] Visit: `https://your-app.vercel.app/admin`
- [ ] Sign in with your admin email
- [ ] Verify dashboard loads
- [ ] Check system information section
- [ ] Test quick action links

### Multi-Device Sync
- [ ] Open app on second device (phone/tablet)
- [ ] Sign in with same account
- [ ] Make a settings change on one device
- [ ] Verify change appears on other device within seconds

### Offline Mode
- [ ] On mobile, enable airplane mode
- [ ] Verify app still works
- [ ] Make a settings change
- [ ] Disable airplane mode
- [ ] Verify change syncs to server

---

## Phase 6: Monitoring Setup (20 minutes)

### Sentry Verification
- [ ] Go to Sentry dashboard: https://sentry.io
- [ ] Open your project
- [ ] Trigger a test error in your app (try accessing `/api/invalid-endpoint`)
- [ ] Verify error appears in Sentry
- [ ] Set up email alerts: Settings → Alerts → New Alert Rule
- [ ] Configure: Alert when error count > 10 in 1 hour

### UptimeRobot Setup
- [ ] Go to UptimeRobot dashboard
- [ ] Click "Add New Monitor"
- [ ] Monitor Type: HTTP(s)
- [ ] URL: `https://your-app.vercel.app/api/health`
- [ ] Monitoring Interval: 5 minutes
- [ ] Add your email for alerts
- [ ] Save monitor
- [ ] Verify first check succeeds

### Security Headers Check
- [ ] Visit: https://securityheaders.com
- [ ] Enter your production URL
- [ ] Run scan
- [ ] Review results (should get A or A+)
- [ ] Note any recommendations

---

## Phase 7: Backup Strategy (15 minutes)

### Test Backup Script
- [ ] Install PostgreSQL client tools (if not installed):
  - macOS: `brew install postgresql`
  - Ubuntu: `sudo apt install postgresql-client`
- [ ] Get database connection string from Supabase Dashboard → Settings → Database
- [ ] Export connection string:
  ```bash
  export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'
  ```
- [ ] Run backup script: `./scripts/backup-database.sh`
- [ ] Verify backup created in `backups/` directory
- [ ] Check backup file size: `ls -lh backups/`

### Schedule Automatic Backups (Optional)
- [ ] Open crontab: `crontab -e`
- [ ] Add weekly backup (every Sunday at 2 AM):
  ```
  0 2 * * 0 cd /path/to/project && export SUPABASE_DB_URL='your_url' && ./scripts/backup-database.sh
  ```
- [ ] Save and exit
- [ ] Or: Set calendar reminder to run manual backups weekly

---

## Phase 8: Documentation Review (15 minutes)

### Read Key Documents
- [ ] Read `SCALABILITY_IMPLEMENTATION_SUMMARY.md` (overview)
- [ ] Skim `OPERATIONS.md` (operational procedures)
- [ ] Skim `MONITORING_SETUP.md` (monitoring guide)
- [ ] Bookmark these files for future reference

### Create Bookmarks
- [ ] Bookmark production URL
- [ ] Bookmark Vercel dashboard
- [ ] Bookmark Supabase dashboard
- [ ] Bookmark Sentry dashboard
- [ ] Bookmark UptimeRobot dashboard (if using)
- [ ] Bookmark admin dashboard: `https://your-app.vercel.app/admin`

---

## Phase 9: Optional Advanced Features (As Needed)

### Rate Limiting with Redis (For Scale)
- [ ] Sign up at https://console.upstash.com/
- [ ] Create Redis database
- [ ] Get REST URL and token
- [ ] Install: `npm install @upstash/ratelimit @upstash/redis`
- [ ] Add to environment variables in Vercel
- [ ] Update `lib/rate-limit.ts` (see `RATE_LIMITING.md`)
- [ ] Deploy and test

### CI/CD with GitHub Actions
- [ ] Create `.github/workflows/ci.yml` (see `GITHUB_SETUP.md`)
- [ ] Add GitHub secrets for Vercel deployment
- [ ] Test workflow by creating a PR
- [ ] Verify tests run automatically

### Admin API for Real Statistics
- [ ] Create `app/api/admin/stats/route.ts`
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (mark as sensitive!)
- [ ] Implement user count queries
- [ ] Update admin dashboard to fetch real data
- [ ] Test in production

### Custom Email SMTP
- [ ] Sign up for SendGrid or Mailgun
- [ ] Get SMTP credentials
- [ ] Configure in Supabase Dashboard → Settings → Auth → SMTP
- [ ] Test email delivery
- [ ] Customize email templates with branding

---

## Phase 10: Post-Launch Monitoring (Ongoing)

### Daily (First Week)
- [ ] Check health endpoint
- [ ] Review Sentry for errors
- [ ] Check uptime monitor
- [ ] Verify sync working
- [ ] Monitor user signups

### Weekly
- [ ] Review error trends in Sentry
- [ ] Check database storage usage
- [ ] Test backup script
- [ ] Review rate limit logs
- [ ] Check for dependency updates: `npm audit`

### Monthly
- [ ] Run full test suite: `npm test && npm run test:e2e`
- [ ] Review security scan results
- [ ] Test disaster recovery procedure
- [ ] Update dependencies: `npm update`
- [ ] Review documentation for accuracy

---

## 🎯 Success Criteria

You've successfully completed the scalability setup when:

- ✅ App deployed to Vercel and accessible online
- ✅ All environment variables configured correctly
- ✅ Health check endpoint returns "healthy"
- ✅ Sentry capturing errors
- ✅ Uptime monitor active and sending alerts
- ✅ Backups tested and working
- ✅ Multi-device sync functioning
- ✅ Admin dashboard accessible
- ✅ Security headers configured (A+ rating)
- ✅ All tests passing
- ✅ Password reset flow working

---

## 🆘 Troubleshooting

### Deployment fails on Vercel
- Check build logs for errors
- Verify all environment variables are set
- Make sure `package.json` and `package-lock.json` are committed
- Try: `npm run build` locally to test

### Health check shows "unhealthy"
- Check Supabase dashboard for database status
- Verify environment variables in Vercel match Supabase
- Check Supabase status page: https://status.supabase.com/

### Sentry not receiving errors
- Verify `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel
- Check DSN is correct
- Trigger a test error: visit `/api/test-error` (create this endpoint)
- Check Sentry project settings

### Emails not sending
- Verify email templates enabled in Supabase
- Check redirect URLs are correct
- Check spam folder
- Verify SMTP settings (if using custom SMTP)

### Rate limiting too strict
- Edit `middleware.ts`
- Increase `maxRequests` value
- Redeploy to Vercel
- Test with multiple requests

### Need help?
- Review `OPERATIONS.md` for detailed troubleshooting
- Check service status pages
- Ask in Discord communities (links in documentation)
- Create GitHub issue in your repository

---

## 📝 Notes & Customization

Use this space to track your specific configuration:

**Production URL**: _______________________________________________

**Supabase Project**: _______________________________________________

**Sentry DSN**: _______________________________________________

**Admin Email**: _______________________________________________

**Vercel Project ID**: _______________________________________________

**Backup Schedule**: _______________________________________________

**Custom Configuration Notes**:
- 
- 
- 

---

## ✅ Completion Checklist

Final verification before considering setup complete:

- [ ] All Phase 1-6 tasks completed
- [ ] Production app accessible and working
- [ ] Health monitoring active
- [ ] Error tracking configured
- [ ] Backups tested
- [ ] Documentation read and bookmarked
- [ ] Team members have access (if applicable)
- [ ] Monitoring alerts configured
- [ ] Security scan passed
- [ ] This file reviewed and understood

**Date Completed**: _______________

**Completed By**: _______________

**Next Review Date**: _______________ (recommend: 1 month from completion)

---

## 🚀 You're Ready for Production!

Once all checkboxes are ticked, your app is production-ready and can scale confidently!

**Remember**:
- Monitor daily for the first week
- Run backups regularly
- Keep dependencies updated
- Review operations runbook regularly
- Document any issues you encounter

**Good luck with your launch! 🎉**
