# Monitoring & Uptime Setup

## Health Check Endpoint

The application now includes a health check endpoint at `/api/health`.

### Endpoint Details

**URL**: `https://your-app.vercel.app/api/health`

**Response** (healthy):
```json
{
  "status": "healthy",
  "timestamp": "2024-12-14T10:30:00.000Z",
  "checks": {
    "api": "ok",
    "database": "ok",
    "mode": "online"
  },
  "uptime": 86400,
  "responseTime": 45
}
```

**Response** (unhealthy):
```json
{
  "status": "unhealthy",
  "timestamp": "2024-12-14T10:30:00.000Z",
  "checks": {
    "api": "ok",
    "database": "error",
    "mode": "online"
  },
  "uptime": 86400,
  "responseTime": 125
}
```

**Status Codes**:
- `200`: Healthy
- `503`: Unhealthy (service unavailable)

## Uptime Monitoring Setup

### Option 1: UptimeRobot (Recommended - Free)

**Cost**: Free for up to 50 monitors

**Features**:
- 5-minute check intervals
- Email/SMS alerts
- Status page
- 2-month logs

**Setup**:

1. **Sign up**: https://uptimerobot.com/signUp

2. **Add Monitor**:
   - Click "Add New Monitor"
   - Monitor Type: HTTP(s)
   - Friendly Name: "Go To Sleep Clock"
   - URL: `https://your-app.vercel.app/api/health`
   - Monitoring Interval: 5 minutes

3. **Set up alerts**:
   - Alert Contacts → Add Email
   - Alert When: Down
   - Re-notify: Every 15 minutes

4. **Create Status Page** (optional):
   - Public Status Pages → Create
   - Add your monitor
   - Share URL with users

### Option 2: Better Uptime (Alternative - Free)

**Cost**: Free for up to 10 monitors

**Features**:
- 30-second check intervals
- Incident management
- Beautiful status pages
- Slack/Discord integration

**Setup**:

1. **Sign up**: https://betteruptime.com

2. **Create Monitor**:
   - Monitors → Create Monitor
   - URL: `https://your-app.vercel.app/api/health`
   - Check frequency: 30 seconds
   - Expected status code: 200

3. **Configure alerts**:
   - Integrations → Add your email
   - Set up escalation policy

4. **Create Status Page**:
   - Status Pages → Create
   - Add your monitors
   - Customize branding

### Option 3: Vercel Analytics (Built-in)

**Cost**: Included with Vercel

**Features**:
- Automatic monitoring
- Performance metrics
- Real user monitoring
- Web vitals tracking

**Setup**:

1. Go to Vercel Dashboard → Your Project → Analytics
2. No additional setup required!
3. View metrics in dashboard

## Monitoring Strategy

### Critical Metrics to Track

1. **Uptime**
   - Target: >99.5%
   - Alert if down for >5 minutes

2. **Response Time**
   - Target: <500ms
   - Alert if >2 seconds

3. **Error Rate**
   - Target: <0.1%
   - Alert if >1% errors

4. **Database Connection**
   - Target: Always connected
   - Alert immediately if disconnected

### Alert Configuration

**Priority Levels**:

1. **P1 (Critical)** - Immediate notification:
   - Site completely down
   - Database unreachable
   - API returning 500 errors

2. **P2 (High)** - Notify within 15 minutes:
   - Slow response times (>2s)
   - High error rate (>1%)
   - Degraded performance

3. **P3 (Low)** - Daily summary:
   - Minor performance issues
   - Occasional timeouts
   - Non-critical warnings

### Testing Your Monitoring

**Test health endpoint**:
```bash
curl https://your-app.vercel.app/api/health
```

**Expected response**:
- Status: 200
- Response time: <500ms
- All checks: "ok"

**Test failure scenario** (in development):
1. Stop Supabase (disconnect database)
2. Check health endpoint
3. Should return status: "unhealthy"
4. Verify alert is sent

## Dashboard Setup

### Grafana (Advanced - Optional)

For advanced monitoring with custom dashboards:

1. **Sign up**: https://grafana.com
2. **Create dashboard**
3. **Add data sources**:
   - Vercel API
   - Supabase API
   - Custom metrics endpoint
4. **Build visualizations**:
   - Uptime percentage
   - Response time trends
   - Error rate graphs
   - User activity

### Simple Health Check Script

For quick manual checks:

```bash
#!/bin/bash
# save as scripts/check-health.sh

HEALTH_URL="https://your-app.vercel.app/api/health"

response=$(curl -s -w "\n%{http_code}" $HEALTH_URL)
status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ $status_code -eq 200 ]; then
    echo "✓ Service is healthy"
    echo "$body" | jq .
else
    echo "✗ Service is unhealthy (status: $status_code)"
    echo "$body" | jq .
    exit 1
fi
```

## Integration with Sentry

Sentry automatically tracks:
- Unhandled errors
- Performance issues
- Transaction traces
- User sessions

**No additional setup needed** - Sentry was configured earlier!

## Monitoring Checklist

### Initial Setup
- [ ] Deploy app to Vercel
- [ ] Verify `/api/health` endpoint works
- [ ] Sign up for UptimeRobot or Better Uptime
- [ ] Add health check monitor
- [ ] Configure email alerts
- [ ] Test alerts (trigger a failure)
- [ ] Create status page (optional)

### Weekly Tasks
- [ ] Review uptime percentage
- [ ] Check average response times
- [ ] Review any incidents
- [ ] Update alert thresholds if needed

### Monthly Tasks
- [ ] Review all monitoring metrics
- [ ] Update incident response procedures
- [ ] Test recovery procedures
- [ ] Review and optimize slow endpoints

## Incident Response

### When Alert Fires

1. **Acknowledge alert** (within 5 minutes)
2. **Check health endpoint** manually
3. **Review logs**:
   - Vercel: `vercel logs`
   - Sentry: Check for errors
   - Supabase: Database logs
4. **Identify issue**:
   - Database down?
   - API endpoint failing?
   - Network issue?
5. **Take action**:
   - Restart if needed
   - Rollback if recent deployment
   - Scale up if capacity issue
6. **Verify recovery**
7. **Document incident**
8. **Post-mortem** (for major incidents)

### Escalation

**Level 1**: Automatic restart (Vercel handles this)
**Level 2**: Manual intervention required
**Level 3**: Contact Supabase/Vercel support

## Cost Summary

| Service | Cost | Features |
|---------|------|----------|
| Health Endpoint | $0 | Built-in |
| UptimeRobot | $0 | 50 monitors, 5-min intervals |
| Better Uptime | $0 | 10 monitors, 30-sec intervals |
| Vercel Analytics | $0 | Included with Vercel |
| Sentry | $0 | 5,000 errors/month |
| **Total** | **$0/month** | ✅ |

## Useful Commands

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health | jq

# Monitor continuously
watch -n 5 'curl -s https://your-app.vercel.app/api/health | jq .status'

# Check response time
time curl https://your-app.vercel.app/api/health

# Test from different regions (using curl)
curl -w "@curl-format.txt" https://your-app.vercel.app/api/health
```

## Next Steps

1. Deploy app to Vercel
2. Set up UptimeRobot monitor
3. Configure email alerts
4. Test monitoring works
5. Create status page (optional)
6. Monitor for 1 week to establish baseline
7. Adjust alert thresholds based on actual performance
