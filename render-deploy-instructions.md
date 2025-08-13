# 🚀 Deploy to Render.com - Instructions

## Step 1: Connect Your Repository

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect repository"**
4. Authorize Render to access your GitHub account
5. Select your repository: `swairua/invoicing-software`

## Step 2: Render Will Auto-Configure

Render will automatically detect your `render.yaml` file and set up:

- **Service Name**: `fusion-invoicing-app`
- **Environment**: Node.js
- **Plan**: Free tier
- **Build Command**: `npm ci && npm run build:production`
- **Start Command**: `npm start`
- **Health Check**: `/api/ping`

## Step 3: Configure Environment Variables

In the Render dashboard, these variables are pre-configured:

✅ **Already Set:**

- `NODE_ENV` = `production`
- `PING_MESSAGE` = `Fusion Invoicing API is running`
- `PORT` = `10000`

🔧 **Add These Optional Variables:**

Click **"Environment"** tab and add:

```
DATABASE_URL = postgresql://neondb_owner:npg_smrD4peod8xL@ep-delicate-shape-aewuio49-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Start the server
   - Provide you with a live URL like: `https://fusion-invoicing-app.onrender.com`

## Step 5: Verify Deployment

Once deployed, test these endpoints:

- **🏠 Homepage**: `https://your-app.onrender.com/`
- **🔍 Health Check**: `https://your-app.onrender.com/health`
- **📡 API Status**: `https://your-app.onrender.com/api/ping`

## 🎉 Your Invoice System Will Be Live!

Features that will work:

- ✅ Customer management
- ✅ Product catalog
- ✅ Invoice generation
- ✅ PDF downloads
- ✅ Quotations & Proformas
- ✅ Payment tracking
- ✅ Database persistence (Supabase)

## 🚨 If You Encounter Issues:

1. **Build Fails**: Check the build logs in Render dashboard
2. **App Won't Start**: Verify environment variables
3. **Database Issues**: Check your Supabase connection
4. **404 Errors**: Wait a few minutes for DNS propagation

## 📊 Monitoring Your App:

- **Logs**: Available in Render dashboard
- **Metrics**: CPU, memory usage tracked automatically
- **Alerts**: Set up notifications for downtime

---

**🔗 Quick Deploy Link**: [Connect Repository to Render](https://dashboard.render.com/select-repo)
