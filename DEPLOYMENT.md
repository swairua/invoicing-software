# Deployment Guide - Fusion Invoicing System

## 🚀 Quick Deployment Options

### Option 1: Netlify Deployment (Recommended)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables (see below)

### Option 2: Vercel Deployment

1. **Connect to Vercel**:
   - Import your repository to Vercel
   - Vercel will auto-detect the configuration
   - Add environment variables (see below)

### Option 3: Manual Server Deployment

1. **Build the application**:
   ```bash
   npm run build:production
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

## 🔧 Required Environment Variables

For any deployment platform, configure these environment variables:

### Database Configuration
```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
```

### Security
```env
JWT_SECRET=your-secure-jwt-secret-key
```

## 🗄️ Database Setup

1. **Ensure MySQL database is accessible**
2. **Run migration** (if needed):
   ```bash
   npm run db:migrate
   ```
3. **Create admin user**:
   ```bash
   npm run create-admin-user
   ```

## 🔍 Health Check

The application includes a health check endpoint:
- `GET /api/health` - Returns system status and database connectivity

## 📦 Build Details

- **Client Build**: Static React SPA in `dist/` directory
- **Server Build**: Express server compiled to `dist/production.mjs`
- **Assets**: All static assets optimized and bundled

## 🚀 Production Ready Features

- Optimized build pipeline
- Database connection pooling
- JWT authentication
- Error handling and logging
- Health monitoring
- SSL/TLS support

## 🔧 Troubleshooting

### Database Connection Issues
1. Verify environment variables are set correctly
2. Check MySQL server accessibility
3. Confirm SSL requirements for cloud databases

### Build Issues
1. Run `npm run typecheck` to check TypeScript errors
2. Ensure all dependencies are installed
3. Check Node.js version compatibility (20+)

### Authentication Issues
1. Verify JWT_SECRET is set
2. Run `npm run create-admin-user` to create admin account
3. Check database user table has records
