# Quick Deploy Guide

## First Time Setup (One-time only)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```
Follow the prompts to authenticate (usually opens browser).

### 3. First Deployment
```bash
npm run deploy
```

During first deployment, Vercel will ask:
- **Set up and deploy?** → `Y` (yes)
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (no, create new)
- **Project name?** → Press Enter (uses `go-to-sleep-clock`)
- **Directory?** → Press Enter (uses current directory)
- **Override settings?** → `N` (no)

After deployment completes, Vercel will give you a production URL like:
`https://go-to-sleep-clock.vercel.app`

### 4. Add Environment Variables

**Option A: Via CLI (fastest)**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://xsdkumlemvtegnglhtcn.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste your anon key from .env.local
```

**Option B: Via Dashboard**
1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xsdkumlemvtegnglhtcn.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)

### 5. Redeploy with Environment Variables
```bash
npm run deploy
```

---

## Quick Deploy (After Setup)

Once everything is configured, deploying new features is super easy:

```bash
npm run deploy
```

That's it! Takes ~2 minutes.

---

## Deploy Commands

- **`npm run deploy`** - Deploy to production (live URL)
- **`npm run deploy:preview`** - Deploy preview (test URL, doesn't affect production)

---

## Testing on iPad

1. Get your production URL from terminal output
2. Open Safari on iPad
3. Go to your Vercel URL
4. Tap Share button → **Add to Home Screen**
5. Test the app!

---

## Troubleshooting

### Build fails with "Environment variables not found"
Run: `vercel env pull` to sync env vars locally, then redeploy.

### Changes not showing up?
- Clear cache: `vercel --prod --force`
- Or wait 30 seconds (CDN cache)

### Want to see deployment status?
- Go to https://vercel.com/dashboard
- Click your project → **Deployments** tab

---

## Advanced: Deploy from Git (Optional)

If you want automatic deployments on every push:

1. Create GitHub repo
2. Push your code:
   ```bash
   git remote add origin https://github.com/yourname/go-to-sleep-clock.git
   git push -u origin main
   ```
3. In Vercel dashboard, connect the GitHub repo
4. Every push will auto-deploy!

---

**Quick Reference:**
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/xsdkumlemvtegnglhtcn
