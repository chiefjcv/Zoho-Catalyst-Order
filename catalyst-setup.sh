#!/bin/bash
# Zoho Catalyst Quick Setup Script
# This script prepares your application for Zoho Catalyst deployment

set -e

echo "🚀 Zoho Catalyst Deployment Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js detected: $(node -v)"
echo "✅ NPM detected: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm run install-all

# Create environment file if it doesn't exist
if [ ! -f .catalyst-env ]; then
    echo ""
    echo "📝 Creating .catalyst-env file..."
    cp .catalyst-env.example .catalyst-env
    echo "⚠️  Please edit .catalyst-env with your database and JWT secret"
else
    echo "✅ .catalyst-env already exists"
fi

# Build the application
echo ""
echo "🔨 Building the application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .catalyst-env with your database URL and JWT secret"
echo "2. Push your changes to GitHub"
echo "3. In Zoho Catalyst Console:"
echo "   - Connect your GitHub repository"
echo "   - Set environment variables matching .catalyst-env"
echo "   - Trigger a deployment"
echo ""
echo "For detailed instructions, see CATALYST_DEPLOYMENT.md"
