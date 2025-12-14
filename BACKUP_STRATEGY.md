# Database Backup Strategy

## Overview

This document outlines the backup strategy for the Go To Sleep Clock application database.

## Backup Methods

### Option 1: Supabase Pro (Recommended for Production)

**Cost**: $25/month

**Features**:
- Automated daily backups
- Point-in-time recovery (7 days)
- One-click restore from dashboard
- No manual intervention required

**Setup**:
1. Upgrade to Supabase Pro
2. Go to Dashboard → Database → Backups
3. Enable automatic backups
4. Configure retention period

### Option 2: Manual Backups (Free Tier)

**Cost**: Free

**Features**:
- Manual backup script provided
- Uses `pg_dump` for complete database export
- Automatic compression
- Retention policy (keeps last 7 days)

**Setup**:

1. **Install PostgreSQL client** (for pg_dump):
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql-client
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Get your database connection string**:
   - Go to Supabase Dashboard → Settings → Database
   - Copy the "Connection string" (the one that starts with `postgresql://`)
   - Replace `[YOUR-PASSWORD]` with your actual database password

3. **Set environment variable**:
   ```bash
   export SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres'
   ```

4. **Run backup script**:
   ```bash
   cd "Go To Sleep Clock"
   ./scripts/backup-database.sh
   ```

5. **Verify backup**:
   ```bash
   ls -lh backups/
   ```

### Option 3: Automated Script (Cron)

**Setup cron job** (runs every Sunday at 2 AM):

```bash
# Edit crontab
crontab -e

# Add this line:
0 2 * * 0 cd /path/to/project && export SUPABASE_DB_URL='your_connection_string' && ./scripts/backup-database.sh >> /var/log/supabase-backup.log 2>&1
```

## Backup Schedule Recommendations

### Development/Testing
- **Frequency**: Weekly
- **Retention**: 2 weeks
- **Method**: Manual script

### Production (10-50 users)
- **Frequency**: Daily
- **Retention**: 30 days
- **Method**: Supabase Pro (if budget allows) or automated script

### Production (50+ users)
- **Frequency**: Daily + hourly (during peak hours)
- **Retention**: 90 days
- **Method**: Supabase Pro + external storage (S3)

## Cloud Storage Integration (Optional)

### AWS S3

1. **Install AWS CLI**:
   ```bash
   brew install awscli
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```

3. **Uncomment upload section in backup script**:
   ```bash
   # Edit scripts/backup-database.sh
   # Uncomment the AWS S3 upload lines
   ```

4. **Test upload**:
   ```bash
   aws s3 cp backups/backup-latest.sql.gz s3://your-bucket/backups/
   ```

### Google Cloud Storage

1. **Install gcloud CLI**
2. **Authenticate**: `gcloud auth login`
3. **Upload**: `gsutil cp backup.sql.gz gs://your-bucket/backups/`

## Restore Procedures

### From Manual Backup

```bash
# Decompress backup
gunzip -c backups/backup-2024-12-14.sql.gz > restore.sql

# Restore to database
psql $SUPABASE_DB_URL < restore.sql

# Verify restoration
psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM profiles;"
```

### From Supabase Pro Backup

1. Go to Supabase Dashboard → Database → Backups
2. Select backup to restore
3. Click "Restore"
4. Confirm restoration
5. Wait for process to complete

## Testing Backups

**Critical**: Always test your backups!

### Monthly Test Procedure

1. **Create test Supabase project**
2. **Restore latest backup to test project**:
   ```bash
   gunzip -c backups/backup-latest.sql.gz | psql $TEST_DB_URL
   ```
3. **Verify data integrity**:
   ```bash
   # Count records
   psql $TEST_DB_URL -c "SELECT COUNT(*) FROM profiles;"
   psql $TEST_DB_URL -c "SELECT COUNT(*) FROM settings;"
   
   # Check recent data
   psql $TEST_DB_URL -c "SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5;"
   ```
4. **Delete test project**

## Disaster Recovery

### Scenario 1: Accidental Data Deletion

1. Stop the application immediately
2. Identify when the issue occurred
3. Restore from most recent backup before the incident
4. Verify data restoration
5. Resume application

**Recovery Time Objective (RTO)**: 1 hour  
**Recovery Point Objective (RPO)**: 24 hours (daily backups)

### Scenario 2: Database Corruption

1. Contact Supabase support immediately
2. They may be able to recover from their internal backups
3. If not, restore from your backup
4. Verify data integrity before resuming

### Scenario 3: Complete Database Loss

1. Create new Supabase project
2. Run migration: `supabase/migrations/001_initial_schema.sql`
3. Restore from latest backup
4. Update environment variables with new database URL
5. Deploy application with new configuration

## Backup Security

### Encryption

Backups contain sensitive data. Always encrypt:

```bash
# Encrypt backup
gpg -c backups/backup-2024-12-14.sql.gz

# Decrypt when needed
gpg backups/backup-2024-12-14.sql.gz.gpg
```

### Access Control

- Store backups in secure location
- Limit access to backup files
- Use IAM roles for cloud storage
- Never commit backups to git

### Best Practices

1. ✅ Store backups in multiple locations
2. ✅ Test restoration quarterly
3. ✅ Encrypt sensitive backups
4. ✅ Monitor backup success/failures
5. ✅ Document restoration procedures
6. ✅ Keep backup scripts in version control
7. ❌ Never store backups in public locations
8. ❌ Never store backup passwords in scripts

## Monitoring Backup Health

### Manual Monitoring

Check backup directory weekly:
```bash
ls -lh backups/ | tail -10
```

### Automated Monitoring

Add to cron script:
```bash
# Check if backup was created today
BACKUP_TODAY=$(find backups/ -name "backup-$(date +%Y-%m-%d)*.gz" | wc -l)
if [ $BACKUP_TODAY -eq 0 ]; then
    echo "ERROR: No backup created today!" | mail -s "Backup Failed" admin@example.com
fi
```

## Cost Comparison

| Method | Cost/Month | Automation | Recovery Time | Retention |
|--------|------------|------------|---------------|-----------|
| Manual Script | $0 | Manual | ~1 hour | Custom |
| Supabase Pro | $25 | Automatic | ~15 min | 7-30 days |
| S3 Storage | ~$1 | Semi-auto | ~1 hour | Unlimited |

## Recommendation

**For 10-50 users (current scale)**:
- Start with manual script + weekly backups
- When you have budget, upgrade to Supabase Pro
- Add S3 storage when you hit 100+ users

**For 100+ users**:
- Use Supabase Pro for automatic daily backups
- Add S3/GCS for long-term retention
- Implement monitoring and alerting
- Test recovery procedures monthly

## Support

For backup issues:
- Supabase Discord: https://discord.supabase.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/current/backup.html
- AWS S3 Docs: https://docs.aws.amazon.com/s3/
