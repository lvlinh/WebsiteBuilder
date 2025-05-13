#!/bin/bash
# Database Sync Tools Runner

echo "🔧 SJJS Database Tools 🔧"
echo "=========================="
echo "1. Sync database from Neon to local"
echo "2. Dump database schema from Neon"
echo "3. Check schema differences"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
  1)
    echo "🔄 Running database sync..."
    node scripts/db-sync.js
    ;;
  2)
    echo "📝 Dumping database schema..."
    node scripts/dump-schema.js
    ;;
  3)
    echo "🔍 Checking schema differences..."
    node scripts/check-schema.js
    ;;
  4)
    echo "👋 Exiting..."
    exit 0
    ;;
  *)
    echo "❌ Invalid option"
    exit 1
    ;;
esac