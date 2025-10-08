#!/bin/bash

# Database Permissions Fixer Script
# This script fixes read-only database issues for SQLite in production

echo "🔍 Checking database permissions..."

# Find the database file
DB_DIR="./prisma"
DB_FILE="$DB_DIR/dev.db"

if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file not found: $DB_FILE"
    echo "Looking for database file..."
    find . -name "*.db" -type f
    exit 1
fi

echo "✅ Found database: $DB_FILE"
echo ""

# Check current permissions
echo "📋 Current file permissions:"
ls -lh "$DB_FILE"
echo ""

# Check directory permissions
echo "📋 Current directory permissions:"
ls -ldh "$DB_DIR"
echo ""

# Get current user
CURRENT_USER=$(whoami)
echo "👤 Current user: $CURRENT_USER"
echo ""

# Fix file permissions
echo "🔧 Fixing database file permissions..."
chmod 664 "$DB_FILE" 2>/dev/null && echo "✅ File permissions updated" || echo "⚠️ Could not update file permissions (may need sudo)"

# Fix directory permissions
echo "🔧 Fixing directory permissions..."
chmod 775 "$DB_DIR" 2>/dev/null && echo "✅ Directory permissions updated" || echo "⚠️ Could not update directory permissions (may need sudo)"

# Change ownership if running as root or with sudo
if [ "$EUID" -eq 0 ]; then
    echo "🔧 Fixing ownership (running as root)..."
    chown "$CURRENT_USER:$CURRENT_USER" "$DB_FILE"
    chown "$CURRENT_USER:$CURRENT_USER" "$DB_DIR"
fi

echo ""
echo "📋 Updated permissions:"
ls -lh "$DB_FILE"
ls -ldh "$DB_DIR"
echo ""

# Test write access
echo "🧪 Testing write access..."
if [ -w "$DB_FILE" ]; then
    echo "✅ Database is writable!"
else
    echo "❌ Database is still read-only!"
    echo ""
    echo "🔧 Try running with sudo:"
    echo "   sudo bash fix-db-permissions.sh"
    echo ""
    echo "Or manually fix with:"
    echo "   sudo chmod 664 $DB_FILE"
    echo "   sudo chmod 775 $DB_DIR"
    echo "   sudo chown $CURRENT_USER:$CURRENT_USER $DB_FILE"
    exit 1
fi

echo ""
echo "🎉 Database permissions fixed successfully!"
echo ""
echo "💡 If issues persist, check:"
echo "   1. The parent directories are also writable"
echo "   2. The database isn't mounted read-only"
echo "   3. SELinux/AppArmor policies (if applicable)"
