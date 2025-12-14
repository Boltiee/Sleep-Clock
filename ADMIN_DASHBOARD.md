# Admin Dashboard Documentation

## Overview

A basic admin dashboard has been created at `/admin` for monitoring and managing the application.

## Access Control

### Configuration

Set admin email in `.env.local`:

```bash
NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
```

### Security

- Only users with the configured admin email can access
- Requires authentication (sign in first)
- Not available in local mode
- Protected by rate limiting

## Features

### Statistics Dashboard

- Total users count
- Total profiles count
- Recent signups (7 days)
- Active users today

**Note**: Stats are currently placeholders. To implement real stats, you need to:

1. Create API routes in `app/api/admin/`
2. Use Supabase service role key (server-side only!)
3. Query database for actual counts

### Quick Actions

Direct links to:
- Supabase Dashboard
- Vercel Dashboard
- Sentry Dashboard
- Health Check Endpoint
- Refresh Stats
- Back to App

### System Information

- Environment (development/production)
- Mode (local/online)
- Supabase configuration status
- Sentry configuration status

### Documentation Links

Quick access to all setup and operation guides.

## Implementing Real Statistics

### Step 1: Create Admin API Route

Create `app/api/admin/stats/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentUser } from '@/lib/supabase'

// Use service role key for admin queries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Never expose to client!
)

export async function GET(request: Request) {
  try {
    // Verify admin access
    const user = await getCurrentUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Query statistics
    const [usersResult, profilesResult] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('profiles').select('count').single(),
    ])

    // Count recent signups (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentUsers = usersResult.data?.users.filter(
      user => new Date(user.created_at) > sevenDaysAgo
    ) || []

    return NextResponse.json({
      totalUsers: usersResult.data?.users.length || 0,
      totalProfiles: profilesResult.data?.count || 0,
      recentSignups: recentUsers.length,
      activeToday: 0, // Implement with activity tracking
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

### Step 2: Add Service Role Key

Add to `.env.local` (NEVER commit this!):

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ADMIN_EMAIL=your_admin_email@example.com
```

Get service role key from:
Supabase Dashboard → Settings → API → `service_role` key (secret)

⚠️ **WARNING**: Service role key bypasses RLS. Only use server-side!

### Step 3: Update Dashboard to Fetch Stats

Update `app/admin/page.tsx`:

```typescript
async function loadStats() {
  try {
    const response = await fetch('/api/admin/stats')
    if (!response.ok) throw new Error('Failed to load stats')
    
    const data = await response.json()
    setStats(data)
  } catch (err: any) {
    setError(err.message || 'Failed to load stats')
  }
}
```

## User Management Features (Future)

### List Users

Create `app/api/admin/users/route.ts`:

```typescript
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      settings (*),
      daily_state (*)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json(data)
}
```

### Delete User

```typescript
export async function DELETE(request: Request) {
  const { userId } = await request.json()
  
  // Delete user and cascade to profiles, settings, daily_state
  await supabaseAdmin.auth.admin.deleteUser(userId)
  
  return NextResponse.json({ success: true })
}
```

### Reset User PIN

```typescript
export async function POST(request: Request) {
  const { profileId, newPin } = await request.json()
  
  const pinHash = await hashPin(newPin)
  
  await supabaseAdmin
    .from('settings')
    .update({ pin_hash: pinHash })
    .eq('profile_id', profileId)
  
  return NextResponse.json({ success: true })
}
```

## Activity Tracking (Future)

To track active users, add an analytics table:

### Migration

```sql
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'login', 'settings_change', 'chores_complete'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_activity_timestamp ON user_activity(timestamp);
CREATE INDEX idx_user_activity_user ON user_activity(user_id);
```

### Track Activity

```typescript
// lib/analytics.ts
export async function trackActivity(
  userId: string,
  profileId: string,
  activityType: string
) {
  await supabase.from('user_activity').insert({
    user_id: userId,
    profile_id: profileId,
    activity_type: activityType,
  })
}
```

### Query Active Users

```typescript
const today = new Date().toISOString().split('T')[0]

const { data } = await supabaseAdmin
  .from('user_activity')
  .select('user_id')
  .gte('timestamp', `${today}T00:00:00`)
  .lt('timestamp', `${today}T23:59:59`)

const activeToday = new Set(data?.map(row => row.user_id)).size
```

## Security Best Practices

### 1. Protect Admin Routes

All admin routes should:
- Check user authentication
- Verify admin email
- Use rate limiting
- Log access attempts
- Never expose service role key to client

### 2. Use Service Role Key Safely

```typescript
// ✅ GOOD: Server-side only
// app/api/admin/route.ts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ❌ BAD: Never in client components
// app/admin/page.tsx
const supabaseAdmin = createClient(...) // NEVER DO THIS!
```

### 3. Audit Logging

Log all admin actions:

```typescript
await supabaseAdmin.from('admin_audit_log').insert({
  admin_user_id: user.id,
  action: 'delete_user',
  target_user_id: deletedUserId,
  timestamp: new Date().toISOString(),
})
```

### 4. Two-Factor Authentication

For production admin access, consider:
- Requiring 2FA for admin accounts
- IP whitelisting
- VPN requirement
- Time-based access tokens

## Monitoring Admin Activity

### Sentry Integration

```typescript
import * as Sentry from '@sentry/nextjs'

// Log admin actions to Sentry
Sentry.captureMessage('Admin action: delete user', {
  level: 'info',
  extra: {
    adminEmail: user.email,
    action: 'delete_user',
    targetUserId: userId,
  },
})
```

### Email Notifications

Send email on critical admin actions:

```typescript
// After user deletion
await sendEmail({
  to: process.env.ADMIN_EMAIL,
  subject: 'Admin Action: User Deleted',
  body: `User ${userId} was deleted by ${adminEmail} at ${new Date()}`,
})
```

## Dashboard Customization

### Add Charts

Use Chart.js or Recharts:

```bash
npm install recharts
```

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<LineChart data={signupTrend}>
  <XAxis dataKey="date" />
  <YAxis />
  <CartesianGrid stroke="#eee" />
  <Line type="monotone" dataKey="signups" stroke="#8884d8" />
</LineChart>
```

### Add Filters

```typescript
const [dateRange, setDateRange] = useState({ start: '', end: '' })
const [userFilter, setUserFilter] = useState('')

// Apply filters to queries
const filteredUsers = users.filter(user => 
  user.email.includes(userFilter) &&
  new Date(user.created_at) >= new Date(dateRange.start)
)
```

## Deployment

### Production Setup

1. Set `NEXT_PUBLIC_ADMIN_EMAIL` in Vercel environment variables
2. Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (mark as sensitive!)
3. Set `ADMIN_EMAIL` in Vercel (server-side only)
4. Enable 2FA on admin Supabase account
5. Review access logs regularly

### Access Dashboard

1. Deploy to production
2. Sign in with admin email
3. Navigate to `/admin`
4. Bookmark for quick access

## Troubleshooting

### "Access Denied" Error

- Check `NEXT_PUBLIC_ADMIN_EMAIL` matches your email exactly
- Verify you're signed in
- Check browser console for errors
- Verify environment variable is set in Vercel

### Stats Not Loading

- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify API route is deployed
- Check Vercel function logs for errors
- Test API endpoint directly: `/api/admin/stats`

### Service Role Key Not Working

- Verify key is correct (from Supabase Dashboard → Settings → API)
- Check it's the `service_role` key, not `anon` key
- Ensure it's set as server-side environment variable
- Restart Vercel deployment after adding variable

## Future Enhancements

- [ ] Real-time user list with search and pagination
- [ ] User activity timeline
- [ ] Email broadcast system
- [ ] Automated reports
- [ ] Performance metrics dashboard
- [ ] Cost tracking and alerts
- [ ] Backup management UI
- [ ] Database query tool
- [ ] Feature flag management
- [ ] A/B testing dashboard
