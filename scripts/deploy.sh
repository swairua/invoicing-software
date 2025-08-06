#!/bin/bash

# Fusion Invoicing Deployment Script for Render.com
echo "🚀 Preparing Fusion Invoicing for deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type checks..."
npm run typecheck

# Build the application
echo "🏗️  Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📋 Deployment checklist:"
    echo "  1. Ensure your Git repository is pushed to GitHub/GitLab"
    echo "  2. Connect your repository to Render.com"
    echo "  3. Set environment variables:"
    echo "     - NODE_ENV=production"
    echo "     - PORT=10000 (optional, Render sets this)"
    echo "     - DATABASE_URL (if using PostgreSQL)"
    echo "  4. Deploy using the render.yaml configuration"
    echo ""
    echo "🌐 The application will be available at your Render URL"
    echo "🔧 API health check: https://your-app.onrender.com/api/ping"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
