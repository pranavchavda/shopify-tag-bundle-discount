#!/bin/bash

echo "🚀 Setting up Tag Bundle Discount App..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install root dependencies
echo "📦 Installing dependencies..."
npm install

# Install function dependencies
echo "📦 Installing function dependencies..."
cd extensions/product-discount && npm install && cd ../..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Shopify app credentials"
fi

# Initialize database
echo "🗄️  Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Shopify app credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Use ngrok or Shopify CLI to create a tunnel for local development"