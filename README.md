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
- **Database**: MySQL with cloud hosting support
- **Build Tool**: Vite
- **Deployment**: Netlify/Vercel ready

## Development

### Prerequisites

- Node.js 20+
- MySQL database (cloud-hosted)

### Installation

```bash
npm install
```

### Database Configuration

Set up your MySQL database credentials in the `.env` file:

```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Create Admin User

```bash
npm run create-admin-user
```

Default login credentials:

- Email: `admin@demo.com`
- Password: `password`

### Build

```bash
npm run build
```

## Production Deployment

The application can be deployed to:

- Netlify (recommended for static hosting)
- Vercel (recommended for full-stack applications)
- Any cloud provider supporting Node.js

### Environment Variables for Production

```env
DB_HOST=your-production-mysql-host
DB_PORT=3306
DB_USER=your-production-username
DB_PASSWORD=your-production-password
DB_NAME=your-production-database
JWT_SECRET=your-jwt-secret-key
```

## License

MIT License
