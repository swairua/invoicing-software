# Fusion Invoicing System

A comprehensive invoicing and business management system built with React, TypeScript, and Express.

## Features

- **Customer Management**: Create and manage customer profiles with credit tracking
- **Product Management**: Inventory tracking, variants, and stock movements
- **Invoice Generation**: Create professional invoices with automatic calculations
- **Quotations & Proforma**: Generate quotes and proforma invoices
- **Payment Processing**: Record payments with multiple payment methods
- **Tax Configuration**: Flexible tax settings for different regions
- **Reports**: Generate business reports and analytics
- **PDF Export**: Generate PDF invoices and documents

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with migration support
- **Build Tool**: Vite
- **Deployment**: Render.com ready

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL (optional, mock data available)

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Build

```bash
npm run build
```

## Deployment on Render.com

### Option 1: Using render.yaml (Recommended)

1. Connect your repository to Render.com
2. The `render.yaml` file will automatically configure the deployment
3. Set the following environment variables in Render:
   - `NODE_ENV=production`
   - `PORT=10000` (or let Render set this automatically)
   - `DATABASE_URL` (if using PostgreSQL)

### Option 2: Manual Configuration

1. Create a new Web Service on Render.com
2. Connect your repository
3. Use these settings:
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Health Check Path**: `/api/ping`

### Environment Variables

Required environment variables for production:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://username:password@host:port/database
```

Optional environment variables:

```
PING_MESSAGE=Fusion Invoicing API is running
```

### Database Setup

The application supports both PostgreSQL and mock data:

- **Production**: Set `DATABASE_URL` to connect to PostgreSQL
- **Development/Demo**: Leave `DATABASE_URL` unset to use mock data

For PostgreSQL setup, run the migrations:

```bash
cd database/postgres
npm install
npm run migrate
```

## Docker Deployment

A Dockerfile is included for containerized deployments:

```bash
docker build -t fusion-invoicing .
docker run -p 10000:10000 fusion-invoicing
```

## API Endpoints

- `GET /api/ping` - Health check
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/taxes` - Tax configurations

## Project Structure

```
├── client/              # Frontend React application
│   ├── components/      # Reusable UI components
│   ├── pages/          # Application pages
│   ├── services/       # Data services and API clients
│   └── hooks/          # Custom React hooks
├── server/             # Backend Express application
│   ├── routes/         # API route handlers
��   ├── repositories/   # Data access layer
│   └── database.ts     # Database connection
├── shared/             # Shared types and utilities
├── database/           # Database migrations and schema
└── netlify/           # Netlify functions (alternative deployment)
```

## License

MIT License - See LICENSE file for details
