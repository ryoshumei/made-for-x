#!/bin/bash

# Mercari Shipping Calculator - Vercel Deployment Script
# This script handles database migration and seeding for production deployment

echo "🚀 Deploying Mercari Shipping Calculator to Vercel..."
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Step 1: Ensure we're using production schema
echo "📋 Step 1: Setting up production database schema..."
npm run dev:production

# Step 2: Build and test locally first
echo "🔨 Step 2: Building application locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Step 3: Deploy to Vercel
echo "🚀 Step 3: Deploying to Vercel..."
vercel --prod

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed."
    exit 1
fi

echo "✅ Deployment successful!"
echo ""
echo "📋 Post-deployment tasks:"
echo "1. Database migrations will run automatically via vercel.json"
echo "2. You need to manually seed the database using Vercel CLI:"
echo ""
echo "   Run these commands after deployment:"
echo "   vercel env pull .env.production"
echo "   DATABASE_URL=\"\$(grep DATABASE_URL .env.production | cut -d'=' -f2 | tr -d '\"')\" npm run db:seed:prod"
echo ""
echo "🎯 Your Mercari Shipping Calculator is now live!"
echo "📱 Test the shipping calculator at your Vercel URL/shipping-calculator"