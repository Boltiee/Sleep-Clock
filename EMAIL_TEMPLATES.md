# Email Templates Configuration

This guide shows how to configure email templates in Supabase for authentication flows.

## Required Email Templates

### 1. Confirm Signup (Email Verification)
### 2. Reset Password
### 3. Magic Link

## Setup Instructions

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Confirm Signup Template

**When to enable**: After implementing the app in production

**Template**:
```html
<h2>Confirm Your Email</h2>
<p>Hello!</p>
<p>Thanks for signing up for Go To Sleep Clock! Please click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>If you didn't sign up for this app, you can safely ignore this email.</p>
<p>Thanks,<br>Go To Sleep Clock Team</p>
```

**Settings**:
- Enable "Confirm email" in Authentication settings
- Set confirmation URL: `{{ .SiteURL }}/auth/confirm?token={{ .Token }}`

### Step 3: Configure Reset Password Template

**Template**:
```html
<h2>Reset Your Password</h2>
<p>Hello!</p>
<p>We received a request to reset your password for Go To Sleep Clock. Click the link below to choose a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request a password reset, you can safely ignore this email.</p>
<p>Thanks,<br>Go To Sleep Clock Team</p>
```

**Settings**:
- Redirect URL: `{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery`

### Step 4: Configure Magic Link (Optional)

**Template**:
```html
<h2>Sign In to Go To Sleep Clock</h2>
<p>Hello!</p>
<p>Click the link below to sign in to your account:</p>
<p><a href="{{ .ConfirmationURL }}">Sign In</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you didn't request this email, you can safely ignore it.</p>
<p>Thanks,<br>Go To Sleep Clock Team</p>
```

### Step 5: Update Redirect URLs

In **Authentication** → **URL Configuration**, add:
- Site URL: `https://your-production-domain.com`
- Redirect URLs:
  - `https://your-production-domain.com/`
  - `https://your-production-domain.com/reset-password`
  - `https://your-production-domain.com/auth/confirm`
  - For development: `http://localhost:3000/reset-password`

### Step 6: Configure Email Settings

In **Project Settings** → **Authentication**:

**Email Auth**:
- ✅ Enable Email provider
- ✅ Confirm email (recommended for production)
- ⚠️ Secure email change (requires confirmation)
- Set minimum password length: 8 characters

**Email Rate Limiting**:
- Default settings are fine for 10-50 users
- Increase if you experience issues

**SMTP Settings** (Optional - for custom email):
- By default, Supabase uses their SMTP server
- For production, consider using your own SMTP or SendGrid/Mailgun
- Go to **Project Settings** → **Auth** → **SMTP Settings**

## Testing Email Templates

### Test Password Reset:
1. Run app locally: `npm run dev`
2. Go to `/reset-password`
3. Enter your email
4. Check email inbox
5. Click reset link
6. Update password

### Test Email Verification:
1. Sign up with a new email
2. Check inbox for verification email
3. Click confirmation link
4. Should redirect to app

## Email Provider Recommendations

### For Development:
- Use Supabase's default SMTP (no setup required)

### For Production (10-50 users):
- **Supabase SMTP**: Free, works well for small scale
- **SendGrid**: Free tier (100 emails/day)
- **Mailgun**: Free tier (100 emails/day)

### For Scale (50+ users):
- **SendGrid**: $19.95/month (50,000 emails)
- **Mailgun**: $35/month (50,000 emails)
- **AWS SES**: Pay as you go ($0.10 per 1,000 emails)

## Troubleshooting

### Emails Not Sending:
1. Check Supabase logs: Dashboard → Logs → Auth
2. Verify email template is enabled
3. Check spam folder
4. Verify redirect URLs are correct
5. Test with different email provider

### Reset Link Not Working:
1. Check if link has expired (1 hour default)
2. Verify redirect URL matches production domain
3. Check browser console for errors
4. Ensure `/reset-password` page is deployed

### Email Verification Not Required:
1. Go to Authentication → Providers → Email
2. Enable "Confirm email"
3. Users will need to verify before accessing app

## Security Best Practices

1. **Always use HTTPS** in production
2. **Enable email confirmation** to prevent fake signups
3. **Set password requirements**: min 8 chars, upper/lower/number
4. **Enable "Secure email change"** to prevent account takeover
5. **Monitor auth logs** for suspicious activity
6. **Rate limit** authentication endpoints (Supabase does this by default)

## Next Steps After Configuration

1. ✅ Deploy app to production (Vercel/Netlify)
2. ✅ Update Supabase redirect URLs with production domain
3. ✅ Test all email flows in production
4. ✅ Monitor email deliverability
5. ✅ Set up custom SMTP if needed for branding
