# Operations Runbook

## Overview

This runbook provides operational procedures for running and maintaining the Go To Sleep Clock application in production.

## Quick Reference

### Monitoring Dashboards

- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://supabase.com/dashboard
- **Sentry**: https://sentry.io
- **UptimeRobot**: https://uptimerobot.com (if configured)
- **Admin Dashboard**: https://your-app.vercel.app/admin
- **Health Check**: https://your-app.vercel.app/api/health

### Emergency Contacts

- **Primary Contact**: [Your Email]
- **Supabase Support**: https://supabase.com/dashboard/support
- **Vercel Support**: https://vercel.com/support

### Service Status Pages

- **Vercel Status**: https://www.vercel-status.com/
- **Supabase Status**: https://status.supabase.com/
- **GitHub Status**: https://www.githubstatus.com/

## Daily Operations

### Morning Checklist (5 minutes)

- [ ] Check health endpoint: `curl https://your-app.vercel.app/api/health`
- [ ] Review Sentry for new errors (past 24 hours)
- [ ] Check Vercel deployments status
- [ ] Review Supabase database metrics
- [ ] Check uptime monitor (if configured)

### Weekly Checklist (15 minutes)

- [ ] Review error trends in Sentry
- [ ] Check database storage usage
- [ ] Review rate limit logs
- [ ] Test backup script: `./scripts/backup-database.sh`
- [ ] Check for dependency updates: `npm audit`
- [ ] Review failed login attempts (Supabase logs)
- [ ] Check certificate expiry (Vercel handles this)

### Monthly Checklist (1 hour)

- [ ] Review all monitoring metrics
- [ ] Test disaster recovery procedure
- [ ] Update dependencies: `npm update`
- [ ] Review and update documentation
- [ ] Check for security advisories
- [ ] Review admin dashboard stats
- [ ] Audit user access logs
- [ ] Review rate limiting effectiveness
- [ ] Clean up old backups (>30 days)
- [ ] Test email templates

## Common Issues

### Issue: Application is Down

**Symptoms**:
- Health check returns 503
- Users can't access the app
- Uptime monitor alerts firing

**Diagnosis**:
1. Check health endpoint: `curl -I https://your-app.vercel.app/api/health`
2. Check Vercel dashboard for deployment status
3. Check Supabase dashboard for database status
4. Review Sentry for recent errors

**Resolution**:
1. If recent deployment: Rollback via Vercel dashboard
2. If database issue: Check Supabase status page
3. If DDoS: Contact Vercel support
4. If unknown: Check logs and restart if needed

**Post-Incident**:
- Document what happened
- Update runbook if needed
- Schedule post-mortem if major incident

### Issue: Database Connection Errors

**Symptoms**:
- Health check shows `database: error`
- Users see error messages
- Sentry shows Supabase errors

**Diagnosis**:
```bash
# Check database status
curl https://your-app.vercel.app/api/health | jq .checks.database

# Check Supabase status
open https://status.supabase.com/
```

**Resolution**:
1. Check Supabase dashboard → Database → Connection pooling
2. Verify environment variables in Vercel are correct
3. Check if database is paused (free tier auto-pauses after inactivity)
4. Restart database if needed
5. Check connection limits

**Prevention**:
- Upgrade to Supabase Pro for guaranteed uptime
- Set up database connection monitoring
- Implement connection pooling (already done by Supabase)

### Issue: Sync Not Working

**Symptoms**:
- Settings changes not appearing on other devices
- Users report sync delays
- "Last synced" time is old

**Diagnosis**:
1. Check realtime subscription status in Supabase
2. Check WebSocket connections
3. Review sync errors in Sentry
4. Test manually: Make a settings change and watch for update

**Resolution**:
1. Check Supabase Dashboard → Database → Replication
2. Verify realtime is enabled for `settings` table
3. Check for RLS policy issues
4. Restart realtime if needed (Supabase dashboard)
5. Check for network issues blocking WebSockets

**Fallback**:
- App has 60-second polling fallback
- Users can manually refresh settings panel

### Issue: High Error Rate

**Symptoms**:
- Sentry shows spike in errors
- Users reporting issues
- Health check response time increasing

**Diagnosis**:
1. Check Sentry for error patterns
2. Identify affected endpoints
3. Check if recent deployment
4. Review error messages

**Resolution**:
1. If recent deployment: Rollback immediately
2. If specific endpoint: Disable feature or add error handling
3. If database: Check query performance in Supabase
4. If rate limiting: Adjust limits
5. Deploy fix and monitor

**Prevention**:
- Run tests before deployment
- Use staging environment
- Deploy during low-traffic hours
- Monitor errors in real-time after deployment

### Issue: Rate Limit Exceeded

**Symptoms**:
- Users see "Rate limit exceeded" messages
- Increased 429 status codes
- Legitimate users affected

**Diagnosis**:
1. Check rate limit logs in Vercel
2. Identify if attack or legitimate traffic
3. Check IP addresses hitting limits
4. Review rate limit configuration

**Resolution**:
1. If attack: Block IP addresses
2. If legitimate: Increase rate limits in `middleware.ts`
3. If specific endpoint: Adjust per-endpoint limits
4. Consider upgrading to Redis-based rate limiting

**Adjustment**:
```typescript
// middleware.ts
const rateLimitConfig = {
  maxRequests: 60, // Increase from 30
  windowSeconds: 60,
}
```

### Issue: Slow Performance

**Symptoms**:
- Health check response time >2 seconds
- Users report slow loading
- Vercel metrics show high response times

**Diagnosis**:
1. Check health endpoint response time
2. Review Vercel analytics
3. Check database query performance
4. Identify slow endpoints

**Resolution**:
1. Optimize slow database queries (add indexes)
2. Enable caching where appropriate
3. Optimize large API responses
4. Consider CDN for static assets (Vercel does this)
5. Upgrade server resources if needed

**Database Optimization**:
```sql
-- Add index for frequently queried fields
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_settings_profile_id ON settings(profile_id);
```

### Issue: Authentication Failures

**Symptoms**:
- Users can't sign in
- Password resets not working
- Email verification failing

**Diagnosis**:
1. Check Supabase Auth logs
2. Verify email templates configured
3. Check SMTP settings
4. Test auth flow manually

**Resolution**:
1. Check Supabase Dashboard → Authentication → Settings
2. Verify email templates are enabled
3. Check redirect URLs are correct
4. Test password reset flow
5. Check email deliverability

**Common Causes**:
- Incorrect redirect URLs
- Email provider blocking Supabase
- RLS policies too restrictive
- Session expired

### Issue: Storage Running Out

**Symptoms**:
- Database showing high storage usage
- Approaching Supabase limits
- Slow database queries

**Diagnosis**:
```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Resolution**:
1. Clean up old `daily_state` records (>30 days)
2. Remove test data
3. Optimize large fields (compress JSON)
4. Upgrade storage plan if needed
5. Implement data archiving strategy

**Cleanup Script**:
```sql
-- Delete daily states older than 30 days
DELETE FROM daily_state 
WHERE date < CURRENT_DATE - INTERVAL '30 days';
```

## Deployment Procedures

### Standard Deployment

**Pre-Deployment Checklist**:
- [ ] Run tests locally: `npm test && npm run test:e2e`
- [ ] Review changes in PR
- [ ] Check for breaking changes
- [ ] Verify environment variables

**Deployment Steps**:
1. Merge PR to `main` branch
2. Vercel automatically deploys
3. Monitor deployment in Vercel dashboard
4. Check health endpoint after deployment
5. Monitor Sentry for errors (first 15 minutes)
6. Test critical features manually

**Post-Deployment**:
- [ ] Verify health check passes
- [ ] Test auth flow
- [ ] Test sync functionality
- [ ] Check Sentry for new errors
- [ ] Monitor performance metrics

**Rollback Procedure** (if issues):
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Verify rollback successful
5. Document issue for investigation

### Emergency Hotfix

**When to Use**:
- Critical security vulnerability
- Production-breaking bug
- Data loss risk

**Procedure**:
1. Create hotfix branch from `main`
2. Make minimal fix
3. Test thoroughly
4. Deploy directly to production
5. Merge back to `main` and `develop`
6. Document in post-mortem

### Database Migration

**Procedure**:
1. Test migration on staging database
2. Backup production database
3. Schedule maintenance window (if needed)
4. Run migration in Supabase SQL editor
5. Verify migration successful
6. Test application thoroughly
7. Monitor for issues

**Rollback**:
- Keep previous migration for rollback
- Test rollback procedure before migration
- Document rollback steps

## Backup and Recovery

### Regular Backups

**Manual Backup**:
```bash
cd "Go To Sleep Clock"
export SUPABASE_DB_URL='your_connection_string'
./scripts/backup-database.sh
```

**Verify Backup**:
```bash
ls -lh backups/
gunzip -t backups/backup-latest.sql.gz
```

**Automated Backups**:
See [BACKUP_STRATEGY.md](BACKUP_STRATEGY.md) for cron setup.

### Restore Procedure

**Full Restore**:
1. Stop accepting new requests (enable maintenance mode)
2. Verify backup integrity
3. Create new Supabase project (or use existing)
4. Restore database:
   ```bash
   gunzip -c backups/backup-2024-12-14.sql.gz | psql $SUPABASE_DB_URL
   ```
5. Verify data restored
6. Update environment variables (if new database)
7. Deploy application
8. Test thoroughly
9. Resume normal operations

**Partial Restore** (specific table):
```bash
# Extract specific table from backup
gunzip -c backup.sql.gz | sed -n '/CREATE TABLE profiles/,/COPY profiles/p' > profiles-only.sql

# Restore specific table
psql $SUPABASE_DB_URL < profiles-only.sql
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Uptime**: Target >99.5%
   - Monitor via UptimeRobot
   - Alert if down >5 minutes

2. **Response Time**: Target <500ms
   - Monitor via health endpoint
   - Alert if >2 seconds

3. **Error Rate**: Target <0.1%
   - Monitor via Sentry
   - Alert if >1%

4. **Database Performance**
   - Query time <100ms
   - Connection pool usage <80%
   - Storage usage <80%

5. **Auth Success Rate**: Target >98%
   - Monitor login failures
   - Alert on unusual patterns

### Alert Escalation

**Level 1** (Info):
- Performance degradation
- Non-critical errors
- High traffic alerts
- **Action**: Monitor, no immediate action

**Level 2** (Warning):
- Error rate >0.5%
- Response time >1 second
- Database connection issues
- **Action**: Investigate within 1 hour

**Level 3** (Critical):
- Service completely down
- Data loss risk
- Security breach
- **Action**: Immediate response required

### On-Call Procedures

**When Alert Fires**:
1. Acknowledge alert (within 5 minutes)
2. Check health endpoint and dashboards
3. Follow runbook for specific issue
4. Communicate status if major incident
5. Escalate if needed
6. Document actions taken

**Communication**:
- Use status page for updates
- Email users if extended outage
- Post-mortem for major incidents

## Security Procedures

### Security Incident Response

**Suspected Breach**:
1. **Contain**: Disable affected systems
2. **Assess**: Determine scope of breach
3. **Eradicate**: Remove attacker access
4. **Recover**: Restore from clean backups
5. **Post-Incident**: Review and improve

**Steps**:
1. Change all passwords and API keys
2. Review access logs
3. Check for data exfiltration
4. Notify affected users (if required)
5. Document incident
6. Implement preventive measures

### Access Review

**Quarterly**:
- Review Supabase user access
- Review Vercel team members
- Review GitHub collaborators
- Remove unused API keys
- Audit admin dashboard access

### Security Updates

**Critical Security Patch**:
1. Assess severity and impact
2. Test patch in development
3. Schedule emergency deployment
4. Deploy and verify
5. Monitor for issues
6. Document and communicate

## Cost Management

### Monthly Cost Review

**Current Costs** (estimated):
- Vercel: $0 (free tier)
- Supabase: $0 (free tier)
- Sentry: $0 (free tier)
- **Total**: $0/month

**Usage Monitoring**:
- Check Vercel bandwidth usage
- Monitor Supabase database size
- Track Sentry error quota
- Review API request counts

**Scaling Triggers**:
- Upgrade Supabase at 80% database usage
- Upgrade Vercel at 80% bandwidth
- Upgrade Sentry at error limit

### Cost Optimization

**Tips**:
- Clean up old daily_state records
- Optimize database queries
- Compress large JSON fields
- Use CDN for static assets (Vercel does this)
- Monitor and reduce unnecessary API calls

## Disaster Recovery

### Scenarios

**Scenario 1: Complete Infrastructure Loss**
- **RTO**: 4 hours
- **RPO**: 24 hours
- **Procedure**: Restore from backup, redeploy

**Scenario 2: Data Corruption**
- **RTO**: 2 hours
- **RPO**: 24 hours
- **Procedure**: Restore specific tables from backup

**Scenario 3: Region Outage**
- **RTO**: Automatic failover
- **RPO**: 0 (realtime replication)
- **Note**: Vercel and Supabase handle this automatically

### Testing Disaster Recovery

**Quarterly Drill**:
1. Create test environment
2. Simulate disaster scenario
3. Execute recovery procedure
4. Measure RTO/RPO
5. Document lessons learned
6. Update runbook

## Documentation Maintenance

### When to Update

- After major incident
- When procedures change
- After adding new features
- Quarterly review

### What to Document

- Changes to procedures
- New troubleshooting steps
- Updated contact information
- New monitoring tools
- Configuration changes

## Contact Information

### Support Contacts

**Supabase**:
- Dashboard: https://supabase.com/dashboard/support
- Community: https://discord.supabase.com/
- Status: https://status.supabase.com/

**Vercel**:
- Dashboard: https://vercel.com/support
- Status: https://www.vercel-status.com/
- Documentation: https://vercel.com/docs

**Sentry**:
- Dashboard: https://sentry.io/welcome/
- Documentation: https://docs.sentry.io/

### Emergency Procedures

**Complete Outage**:
1. Check service status pages
2. Review recent deployments
3. Check health endpoint
4. Contact support if infrastructure issue
5. Communicate with users
6. Execute recovery plan

**Data Loss**:
1. Stop all writes immediately
2. Assess extent of loss
3. Restore from latest backup
4. Verify restoration
5. Resume operations
6. Document incident

## Useful Commands

```bash
# Check application health
curl https://your-app.vercel.app/api/health | jq

# Check database connection
psql $SUPABASE_DB_URL -c "SELECT 1"

# View Vercel logs
vercel logs

# Run backup
./scripts/backup-database.sh

# Test rate limiting
for i in {1..35}; do curl https://your-app.vercel.app/api/health; sleep 1; done

# Check certificate
openssl s_client -connect your-app.vercel.app:443 -servername your-app.vercel.app

# Monitor response times
while true; do time curl -so /dev/null https://your-app.vercel.app; sleep 5; done
```

## Revision History

- **v1.0** - 2024-12-14 - Initial runbook creation
- Update this section when making changes

---

**Last Updated**: 2024-12-14  
**Next Review**: 2025-03-14  
**Owner**: [Your Name]
