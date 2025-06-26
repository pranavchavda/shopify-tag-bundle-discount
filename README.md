# Tag Bundle Discount - Shopify App

A Shopify app that applies discounts to selected products when they're purchased together with products having a specific tag.

## Features

- Configure discount rules based on product tags
- Apply percentage or fixed amount discounts
- Select specific products to receive discounts
- Automatic discount application at checkout
- Built with Shopify Functions for fast, scalable discount logic

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd extensions/product-discount && npm install
   ```

3. Copy `.env.example` to `.env` and fill in your Shopify app credentials

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

1. Merchants configure discount rules in the app admin
2. They select products that should receive the discount
3. They specify a tag that trigger products must have
4. They set the discount amount (percentage or fixed)
5. When customers add both selected products AND tagged products to cart, the discount automatically applies

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run deploy` - Deploy to Shopify

## Architecture

- **Frontend**: Remix + React + Shopify Polaris
- **Backend**: Remix server with Shopify App Bridge
- **Database**: SQLite with Prisma ORM
- **Discount Logic**: Shopify Functions (WebAssembly)