# GitHub Repository Setup Guide

This guide helps you set up your GitHub repository and configure CI/CD workflows.

## Step 1: Initialize Git Repository

If you haven't already pushed to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete scalability infrastructure"

# Add your GitHub remote
git remote add origin https://github.com/Boltiee/Sleep-Clock.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 2: Configure GitHub Secrets

Go to your GitHub repository: https://github.com/Boltiee/Sleep-Clock

Navigate to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add the following secrets:

### Required Secrets for CI/CD

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Get from: https://supabase.com/dashboard → Your Project → Settings → API

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key
   - Get from: https://supabase.com/dashboard → Your Project → Settings → API

3. **VERCEL_TOKEN** (for deployment)
   - Value: Your Vercel API token
   - Get from: https://vercel.com/account/tokens → Create Token
   - Name it: "GitHub Actions CI/CD"

4. **VERCEL_ORG_ID**
   - Value: Your Vercel organization ID
   - Get from: Run `vercel link` in terminal and check `.vercel/project.json`
   - Or from Vercel dashboard → Settings → General

5. **VERCEL_PROJECT_ID**
   - Value: Your Vercel project ID
   - Get from: Run `vercel link` in terminal and check `.vercel/project.json`
   - Or from Vercel dashboard → Settings → General

### Optional Secrets (for Sentry)

6. **NEXT_PUBLIC_SENTRY_DSN**
   - Value: Your Sentry DSN
   - Get from: https://sentry.io → Your Project → Settings → Client Keys (DSN)

7. **SENTRY_AUTH_TOKEN**
   - Value: Your Sentry auth token
   - Get from: https://sentry.io → Settings → Auth Tokens → Create New Token
   - Scopes needed: `project:read`, `project:releases`, `org:read`

8. **SENTRY_ORG**
   - Value: Your Sentry organization slug
   - Example: `my-company`

9. **SENTRY_PROJECT**
   - Value: Your Sentry project name
   - Example: `go-to-sleep-clock`

## Step 3: Enable GitHub Actions

1. Go to your repository → **Actions** tab
2. Enable workflows if prompted
3. The CI/CD pipeline will run automatically on:
   - Every push to `main` or `develop` branch
   - Every pull request to `main` branch

## Step 4: Set Up Branch Protection Rules (Optional but Recommended)

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Select: `test` (the CI job)
   - ✅ Require conversation resolution before merging
   - ⚠️ Do not require approvals for personal project

## Step 5: Create Development Branch

```bash
# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

## Step 6: Verify CI/CD Pipeline

1. Make a small change (e.g., update README)
2. Commit and push to `develop`:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push
   ```
3. Go to **Actions** tab on GitHub
4. Watch the workflow run
5. All checks should pass ✅

## Workflow Files Created

### `.github/workflows/ci.yml`
Main CI/CD pipeline that runs:
- Linting
- Unit tests
- Build verification
- E2E tests
- Automatic deployment to Vercel

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main`

**Jobs:**
- `test`: Runs all tests on Node 18 and 20
- `deploy-preview`: Deploys PR previews to Vercel
- `deploy-production`: Deploys to production on merge to `main`

### `.github/workflows/codeql.yml`
Security scanning with GitHub CodeQL:
- Scans for security vulnerabilities
- Runs on push, PR, and weekly schedule
- Analyzes JavaScript/TypeScript code

## Deployment Flow

### Feature Development
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push and create PR to `develop`
4. CI runs tests
5. Preview deployment created
6. Review and merge

### Production Release
1. Create PR from `develop` to `main`
2. CI runs full test suite
3. Review changes
4. Merge to `main`
5. Automatic production deployment via Vercel

## Troubleshooting

### CI Failing on "npm ci"
- Make sure `package-lock.json` is committed
- Run `npm install` locally and commit the lockfile

### CI Failing on Tests
- Run tests locally: `npm test && npm run test:e2e`
- Check if Supabase secrets are configured correctly
- Verify environment variables in GitHub Secrets

### Vercel Deployment Failing
- Verify `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets
- Run `vercel link` locally to get correct IDs
- Check Vercel dashboard for error logs

### CodeQL Scan Failing
- This is optional and won't block deployment
- Check the **Security** tab for details
- Fix any high-severity issues found

## Monitoring Deployments

### Vercel Dashboard
- https://vercel.com/dashboard
- View deployments, logs, and analytics
- Monitor performance and errors

### GitHub Actions
- https://github.com/Boltiee/Sleep-Clock/actions
- View workflow runs and logs
- Debug failed builds

### Sentry (if configured)
- https://sentry.io
- Monitor errors in production
- Track performance issues

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Configure GitHub secrets
3. ✅ Verify CI pipeline passes
4. ✅ Set up Vercel deployment
5. ✅ Configure Sentry (optional)
6. 🚀 Start building features!

## Useful Commands

```bash
# Check CI locally before pushing
npm run lint
npm test
npm run build
npm run test:e2e

# Deploy to Vercel manually
npx vercel --prod

# View Vercel logs
npx vercel logs

# Check git status
git status
git log --oneline -10
```

## Resources

- GitHub Actions Documentation: https://docs.github.com/en/actions
- Vercel CLI Documentation: https://vercel.com/docs/cli
- Sentry Next.js Documentation: https://docs.sentry.io/platforms/javascript/guides/nextjs/
