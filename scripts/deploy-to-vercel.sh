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
echo "📋 Automatic deployment process:"
echo "1. ✅ Database migrations run automatically via vercel.json"
echo "2. ✅ Database seeding runs automatically during deployment"
echo "3. ✅ All shipping calculator data is populated automatically"
echo ""
echo "🎯 Your Mercari Shipping Calculator is now live!"
echo "📱 Test the shipping calculator at your Vercel URL/shipping-calculator"