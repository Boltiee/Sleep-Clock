#!/bin/bash
# Database Backup Script for Supabase
# Run this manually or via cron for regular backups

set -e

# Configuration
BACKUP_DIR="backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="${BACKUP_DIR}/backup-${DATE}.sql"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Supabase Database Backup ===${NC}"
echo "Date: $(date)"
echo ""

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory...${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check for required environment variables
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${RED}Error: SUPABASE_DB_URL environment variable not set${NC}"
    echo "Get your database URL from: Supabase Dashboard → Settings → Database → Connection string"
    echo "Export it: export SUPABASE_DB_URL='postgresql://...'"
    exit 1
fi

echo -e "${GREEN}Starting backup...${NC}"

# Perform backup using pg_dump
pg_dump "$SUPABASE_DB_URL" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $BACKUP_SIZE"
    
    # Optional: Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "$BACKUP_FILE"
    COMPRESSED_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    echo -e "${GREEN}✓ Compressed to ${COMPRESSED_SIZE}${NC}"
    
    # Optional: Keep only last 7 days of backups
    echo -e "${YELLOW}Cleaning up old backups (keeping last 7 days)...${NC}"
    find "$BACKUP_DIR" -name "backup-*.sql.gz" -mtime +7 -delete
    
    echo ""
    echo -e "${GREEN}Backup process completed successfully!${NC}"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Optional: Upload to cloud storage (uncomment and configure)
# echo -e "${YELLOW}Uploading to S3...${NC}"
# aws s3 cp "${BACKUP_FILE}.gz" "s3://your-bucket/backups/"

echo ""
echo "To restore from this backup, run:"
echo "  gunzip -c ${BACKUP_FILE}.gz | psql \$SUPABASE_DB_URL"
