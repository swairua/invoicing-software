# Deployment Guide - Fusion Invoicing System

## 🚀 Quick Deployment on Render.com

### Step 1: Prepare Your Repository

1. Ensure all code is committed and pushed to your Git repository (GitHub, GitLab, etc.)
2. Run the deployment check: `npm run deploy-check`

### Step 2: Connect to Render.com

1. Go to [Render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your Git repository

### Step 3: Configure Deployment

Render will automatically detect the `render.yaml` file and configure:

- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Health Check**: `/api/ping`
- **Environment**: Node.js

### Step 4: Set Environment Variables (Optional)

In the Render dashboard, add these environment variables:

**Required for Production:**

- `NODE_ENV` = `production`

**Optional:**

- `DATABASE_URL` = Your PostgreSQL connection string (leave empty for mock data)
- `PING_MESSAGE` = Custom API message

### Step 5: Deploy

Click "Create Web Service" and Render will:

1. Clone your repository
2. Install dependencies
3. Build the application
4. Start the server
5. Provide you with a live URL

---

## 🐳 Docker Deployment

### Build and Run Locally

```bash
docker build -t fusion-invoicing .
docker run -p 10000:10000 -e NODE_ENV=production fusion-invoicing
```

### Deploy to Any Docker Platform

The included `Dockerfile` works with:

- Google Cloud Run
- AWS ECS
- Azure Container Instances
- DigitalOcean App Platform
- Any Kubernetes cluster

---

## 🔧 Manual Deployment

### Prerequisites

- Node.js 20+
- Process manager (PM2 recommended)

### Steps

1. Clone repository on server
2. Install dependencies: `npm ci --production`
3. Build application: `npm run build`
4. Set environment variables:
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```
5. Start server: `npm start`

### With PM2

```bash
npm install -g pm2
pm2 start npm --name "fusion-invoicing" -- start
pm2 startup
pm2 save
```

---

## 🗄️ Database Configuration

### Option 1: Mock Data (Default)

- No setup required
- Perfect for demos and testing
- All data is simulated in memory

### Option 2: PostgreSQL

1. Create a PostgreSQL database
2. Set `DATABASE_URL` environment variable:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```
3. Run migrations:
   ```bash
   cd database/postgres
   npm install
   npm run migrate
   ```

### Supported Database Providers

- **Render PostgreSQL** (recommended for Render deployment)
- **Supabase** (includes auth and real-time features)
- **Neon** (serverless PostgreSQL)
- **PlanetScale** (MySQL compatible)
- Any PostgreSQL-compatible database

---

## 🔍 Health Checks & Monitoring

### Endpoints

- **Health Check**: `GET /health`
- **API Status**: `GET /api/ping`
- **Frontend**: `GET /` (serves React app)

### Monitoring Setup

```bash
# Check if service is running
curl https://your-app.onrender.com/health

# Check API status
curl https://your-app.onrender.com/api/ping
```

---

## 🚨 Troubleshooting

### Build Issues

1. Run `npm run deploy-check` locally
2. Check Node.js version (requires 20+)
3. Verify all dependencies are in package.json

### Runtime Issues

1. Check environment variables
2. Verify database connection (if using PostgreSQL)
3. Check server logs in Render dashboard

### Performance Optimization

1. Enable gzip compression (automatic on Render)
2. Use CDN for static assets
3. Set up database connection pooling for high traffic

---

## 📊 Post-Deployment

### What to Test

1. **Frontend**: Navigate to your Render URL
2. **API**: Check `/api/ping` endpoint
3. **Features**: Test invoice creation, customer management
4. **Performance**: Check page load times

### Monitoring Tools

Consider integrating:

- **Sentry** - Error monitoring
- **LogRocket** - User session recording
- **New Relic** - Performance monitoring

---

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files
- Use Render's environment variable settings
- Rotate database credentials regularly

### HTTPS

- Render provides free SSL certificates
- All traffic is automatically encrypted

### Database Security

- Use connection string with authentication
- Enable SSL for database connections
- Restrict database access to Render IPs only

---

## 📈 Scaling

### Render.com Scaling

- **Free Tier**: 1 instance, 512MB RAM
- **Starter**: 1 instance, 1GB RAM
- **Standard**: Auto-scaling up to 10 instances

### Performance Tips

1. Use database connection pooling
2. Implement caching for frequently accessed data
3. Optimize bundle size (code splitting)
4. Use React.lazy() for route-based code splitting

---

## 🆘 Support

### Getting Help

1. Check the [Render documentation](https://render.com/docs)
2. Review application logs in Render dashboard
3. Test locally with `NODE_ENV=production npm start`

### Common Issues

- **Build failures**: Check package.json dependencies
- **Start failures**: Verify server configuration
- **404 errors**: Ensure React Router is handling routes correctly

---

**🎉 Congratulations! Your Fusion Invoicing System is now deployed and ready for use!**

Access your application at the URL provided by Render and start managing your business invoices, customers, and products.
