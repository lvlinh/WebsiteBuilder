#!/bin/bash
# Install dependencies for database sync tools

echo "📦 Installing required dependencies for database tools..."

# Create a temporary package.json file for the scripts directory
cat > scripts/package.json << EOL
{
  "name": "sjjs-db-tools",
  "version": "1.0.0",
  "description": "Database tools for SJJS project",
  "type": "module",
  "dependencies": {
    "dotenv": "^16.0.3",
    "pg": "^8.10.0"
  }
}
EOL

# Navigate to scripts directory
cd scripts

# Install dependencies
npm install

echo "✅ Dependencies installed successfully"
echo ""
echo "To run the database tools, use:"
echo "   ./scripts/run-db-tools.sh"
echo ""
echo "Make sure your DATABASE_URL environment variable is set correctly to the Neon database URL."