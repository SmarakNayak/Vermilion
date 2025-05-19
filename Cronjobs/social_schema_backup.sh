#!/bin/bash

# Read server colour and status
SERVER_COLOUR=$(cat ~/server_colour 2>/dev/null || echo "unknown")
SERVER_STATUS=$(cat ~/server_status 2>/dev/null || echo "unknown")
BACKUP_DIR="$HOME/pg_backups"
BACKUP_FILE="$(date +%Y%m%d_%H%M%S)_${SERVER_STATUS}_${SERVER_COLOUR}_social_schema.sql"

# backup social schema including large objects
mkdir -p "$BACKUP_DIR"
sudo -u postgres pg_dump -d vermilion --schema social --large-objects > "$BACKUP_DIR/$BACKUP_FILE"

# Check if backup was successful
if [ $? -ne 0 ]; then
  echo "Error: Backup failed for schema $SCHEMA" >&2
  exit 1
fi

# Upload to Cloudflare R2
rclone copy "$BACKUP_DIR/$BACKUP_FILE" r2:backups

# Check if upload was successful
if [ $? -ne 0 ]; then
  echo "Error: Upload to R2 failed for $BACKUP_FILE" >&2
  rm -f "$BACKUP_DIR/$BACKUP_FILE"
  exit 1
fi

# Clean up local backup file
rm -f "$BACKUP_DIR/$BACKUP_FILE"

echo "Backup of schema social completed and uploaded to r2:backups/$BACKUP_FILE"