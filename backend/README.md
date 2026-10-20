# Backend API

Production-ready Node.js + TypeScript API with Fastify.

## Tech Stack

- **Framework**: Fastify
- **Language**: TypeScript
- **Validation**: Zod
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Base Path

All routes are under `/api/v1`

## Architecture

- **Controller**: HTTP request handling
- **Service**: Business logic
- **Repository**: Database access
- **Schema**: Request/response validation
- **Router**: Route definitions

## Modules

- `auth` - Authentication & registration
- `users` - User management
- `products` - Product catalog
- `cart` - Shopping cart
- `orders` - Order management
- `favorites` - User favorites
- `health` - Health check

## Environment Variables

See `.env.example` for required configuration.
