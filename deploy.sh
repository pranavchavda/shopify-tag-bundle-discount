#!/bin/bash

echo "🚀 Deploying Shopify Tag Bundle Discount App to Fly.io..."

# Check if fly is installed
if ! command -v fly &> /dev/null; then
    echo "❌ Fly CLI is not installed. Installing..."
    curl -L https://fly.io/install.sh | sh
fi

# Launch app if it doesn't exist
if ! fly status &> /dev/null; then
    echo "📦 Creating new Fly app..."
    fly launch --name shopify-tag-bundle-discount --region iad --no-deploy
else
    echo "✅ App already exists on Fly.io"
fi

# Set secrets
echo "🔐 Setting environment variables..."
fly secrets set \
    SHOPIFY_API_KEY="${SHOPIFY_API_KEY}" \
    SHOPIFY_API_SECRET="${SHOPIFY_API_SECRET}" \
    SCOPES="${SCOPES:-write_products,read_products,write_discounts,read_discounts}" \
    SHOPIFY_APP_URL="${SHOPIFY_APP_URL:-https://shopify-tag-bundle-discount.fly.dev}"

# Deploy
echo "🚀 Deploying to Fly.io..."
fly deploy

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://shopify-tag-bundle-discount.fly.dev"