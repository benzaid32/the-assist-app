#!/bin/bash
# Enterprise-grade deployment script for isolated Stripe webhook

# Step 1: Install dependencies
echo "Installing dependencies..."
npm install

# Step 2: Build TypeScript code
echo "Building TypeScript code..."
npm run build

# Step 3: Deploy only the Stripe webhook function
echo "Deploying Stripe webhook function..."
firebase deploy --only functions:stripeWebhook

echo "Deployment complete. Verify in Firebase Console."
