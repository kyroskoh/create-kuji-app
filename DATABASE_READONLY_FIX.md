# Database Read-Only Error Fix Guide

## Error Description
```
Error: attempt to write a readonly database
ConnectorError(ConnectorError { 
  kind: QueryError(SqliteError { 
    extended_code: 1032, 
    message: Some("attempt to write a readonly database") 
  })
})
```

## Root Cause
The SQLite database file (`dev.db`) has **read-only permissions**, preventing the server from writing data.

---

## 🔍 Quick Diagnosis

### Check if this affects you:
1. **Error location**: `/home/createkuji/create-kuji-app/server/` (Linux server path)
2. **Operation**: Any database write (create, update, delete)
3. **Symptom**: Settings/prizes/branding sync fails

### Verify the issue on server:
```bash
# SSH into your server
ssh user@your-server

# Check database permissions
ls -la /home/createkuji/create-kuji-app/server/prisma/dev.db

# Look for:
# -r--r--r-- = read-only (BAD)
# -rw-rw-r-- = readable+writable (GOOD)
```

---

## ✅ **Solution 1: Fix Permissions (Recommended)**

### On your deployed server:

```bash
# Navigate to server directory
cd /home/createkuji/create-kuji-app/server

# Use the provided fix script
bash fix-db-permissions.sh

# Or manually fix permissions:
chmod 664 prisma/dev.db
chmod 775 prisma/

# If permission denied, use sudo:
sudo chmod 664 prisma/dev.db
sudo chmod 775 prisma/
sudo chown createkuji:createkuji prisma/dev.db
```

### Permission Breakdown:
- `664` for database file:
  - Owner: read+write (6)
  - Group: read+write (6)
  - Others: read only (4)

- `775` for directory:
  - Owner: read+write+execute (7)
  - Group: read+write+execute (7)
  - Others: read+execute (5)

---

## ✅ **Solution 2: Rebuild Database**

If permissions can't be fixed, recreate the database:

```bash
cd /home/createkuji/create-kuji-app/server

# Backup existing database
cp prisma/dev.db prisma/dev.db.backup

# Delete old database
rm prisma/dev.db

# Recreate with correct permissions
npx prisma migrate reset --force

# Or just run migrations
npx prisma migrate deploy

# Verify new file has correct permissions
ls -la prisma/dev.db
```

---

## ✅ **Solution 3: Check Mount Points**

Sometimes the filesystem is mounted read-only:

```bash
# Check if filesystem is read-only
mount | grep /home

# If shows (ro), remount as read-write
sudo mount -o remount,rw /home

# Or remount the specific partition
sudo mount -o remount,rw /dev/sda1
```

---

## ✅ **Solution 4: Use Docker Volumes (If using Docker)**

If running in Docker, ensure volumes are mounted correctly:

```yaml
# docker-compose.yml
version: '3.8'
services:
  server:
    volumes:
      # Make sure database directory is writable
      - ./server/prisma:/app/server/prisma:rw  # <- note :rw
    environment:
      - DATABASE_URL=file:./prisma/dev.db
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

---

## ✅ **Solution 5: Switch to PostgreSQL (Production)**

For production deployments, consider using PostgreSQL instead of SQLite:

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database
```bash
# Login as postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE create_kuji_db;
CREATE USER create_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE create_kuji_db TO create_user;
\q
```

### 3. Update .env
```env
# Old SQLite
# DATABASE_URL="file:./prisma/dev.db"

# New PostgreSQL
DATABASE_URL="postgresql://create_user:your_secure_password@localhost:5432/create_kuji_db?schema=public"
```

### 4. Migrate
```bash
cd /home/createkuji/create-kuji-app/server
npx prisma migrate deploy
```

---

## 🔧 **Prevention Tips**

### 1. Set Correct Permissions on Deployment
Add to your deployment script:
```bash
#!/bin/bash
# deploy.sh

cd /home/createkuji/create-kuji-app/server

# Ensure correct permissions
chmod 664 prisma/*.db 2>/dev/null || true
chmod 775 prisma/ 2>/dev/null || true

# Restart server
pm2 restart create-kuji-server
```

### 2. Use Proper User/Group
Ensure the Node.js process runs as a user with write access:
```bash
# Check current process user
ps aux | grep node

# If running as wrong user, fix with pm2
pm2 delete create-kuji-server
pm2 start npm --name "create-kuji-server" --user createkuji -- start
```

### 3. Add to .gitignore
Ensure database files aren't committed:
```
# .gitignore
server/prisma/*.db
server/prisma/*.db-journal
```

---

## 📋 **Verification Checklist**

After applying fixes, verify:

- [ ] Database file is writable: `test -w prisma/dev.db && echo "Writable" || echo "Read-only"`
- [ ] Directory is writable: `test -w prisma/ && echo "Writable" || echo "Read-only"`
- [ ] Node process can write: `touch prisma/test.txt && rm prisma/test.txt && echo "Success"`
- [ ] Server can sync: Test settings sync from frontend
- [ ] No errors in logs: `tail -f /path/to/server.log`

---

## 🆘 **Still Not Working?**

### Check SELinux/AppArmor (Linux)
```bash
# Check SELinux status
sestatus

# If enforcing, temporarily disable
sudo setenforce 0

# Check AppArmor
sudo aa-status

# If blocking, add exception
sudo aa-complain /path/to/node
```

### Check Disk Space
```bash
# Check available space
df -h

# Check inodes
df -i

# If full, clean up
sudo apt-get clean
sudo journalctl --vacuum-size=100M
```

### Check File Locks
```bash
# Check for locks on database
lsof prisma/dev.db

# Kill processes if stuck
kill -9 <PID>
```

---

## 📝 **Manual Permission Commands**

Quick reference for manual fixes:

```bash
# Make database writable
chmod 664 prisma/dev.db

# Make directory writable
chmod 775 prisma/

# Change owner to current user
chown $(whoami):$(whoami) prisma/dev.db

# Change owner to specific user
chown createkuji:createkuji prisma/dev.db

# Recursive fix for entire directory
chmod -R 775 prisma/
chown -R createkuji:createkuji prisma/

# Set default umask for new files
umask 0002
```

---

## 🎯 **Best Practice: Use PostgreSQL in Production**

SQLite is great for development but has limitations:
- ❌ No concurrent writes
- ❌ File permission issues
- ❌ Not suitable for high traffic
- ❌ Harder to backup/restore

PostgreSQL advantages:
- ✅ Handles concurrent connections
- ✅ No file permission issues
- ✅ Better performance at scale
- ✅ Easy backups with pg_dump
- ✅ ACID compliant

---

## 📊 **Error Codes Reference**

| Code | Meaning | Solution |
|------|---------|----------|
| 1032 | Read-only database | Fix permissions |
| 1033 | Database corrupt | Restore from backup |
| 1034 | Database disk full | Free up space |
| 1035 | Database locked | Kill locking process |

---

## 💡 **Summary**

**Quick Fix (Most Common)**:
```bash
cd /home/createkuji/create-kuji-app/server
chmod 664 prisma/dev.db
chmod 775 prisma/
```

**If that doesn't work**:
```bash
sudo chmod 664 prisma/dev.db
sudo chmod 775 prisma/
sudo chown createkuji:createkuji prisma/dev.db
```

**Long-term solution**:
Switch to PostgreSQL for production deployments.

---

## 🔗 **Related Documentation**

- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [SQLite File Permissions](https://www.sqlite.org/lockingv3.html)
- [Linux File Permissions Guide](https://wiki.archlinux.org/title/File_permissions_and_attributes)

---

## ✅ **Success Indicators**

You've fixed it when:
1. ✅ No more "readonly database" errors in logs
2. ✅ Settings sync successfully from frontend
3. ✅ Prizes sync successfully
4. ✅ Branding saves without errors
5. ✅ Database file shows `-rw-rw-r--` permissions

The error handling I added will now return a clearer error message if this occurs again!