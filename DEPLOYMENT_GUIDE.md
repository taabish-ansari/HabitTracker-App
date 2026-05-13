# 🚀 HabitTracker Deployment Guide

**Deployment Stack:**
- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (Express.js)
- **Database**: Supabase (PostgreSQL)

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. ✅ GitHub account with your code pushed (already done ✓)
2. ✅ Supabase project created with database schema initialized
3. 🔗 Active Supabase credentials (SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY)

---

## 🎯 Step 1: Verify Supabase Database

Before deploying, make sure your Supabase project has the correct schema:

1. Go to [Supabase Console](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor** and run this to check your tables:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_schema='public';
   ```
4. If tables don't exist, run the schema from [backend/db/supabase_schema.sql](./backend/db/supabase_schema.sql) in the SQL Editor

---

## 🎨 Step 2: Deploy Frontend to Vercel

### Option A: Automatic Deployment (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Click "New Project"**
3. **Import your GitHub repository**:
   - Select `taabish-ansari/HabitTracker-App`
   - Vercel auto-detects it's a Vite project
4. **Configure Environment Variables**:
   - Click "Environment Variables"
   - Add these variables:
     ```
     VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
     VITE_SUPABASE_ANON_KEY=sb_anon_YOUR_ANON_KEY
     VITE_API_URL=https://your-render-backend.onrender.com
     ```
   - Replace with actual values from Supabase & Render (see Step 3)
5. **Set Root Directory**: Set to `frontend` (if prompted)
6. **Click "Deploy"**
7. **Your frontend URL** will be something like: `https://habittracker-app.vercel.app`

### Option B: Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Build frontend
cd frontend
npm run build

# Deploy
vercel --prod
```

---

## 🖥️ Step 3: Deploy Backend to Render

### Setup Steps:

1. **Go to Render**: https://render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub** (if not already):
   - Authorize GitHub
   - Select repository: `HabitTracker-App`
4. **Configure Service**:
   - **Name**: `habittracker-api` (or any name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Region**: Choose closest to you (e.g., Frankfurt, US East)
5. **Add Environment Variables**:
   - Click "Environment" section
   - Add all these variables:
     ```
     NODE_ENV=production
     ALLOW_GUEST_ACCESS=false
     PORT=10000
     SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
     SUPABASE_KEY=sb_anon_YOUR_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
     JWT_SECRET=generate-a-random-secret-key
     DEMO_USER_EMAIL=demo@habittracker.local
     DEMO_USER_USERNAME=Demo User
     DEMO_USER_PASSWORD=GenerateASecurePassword123!
     ```
6. **Click "Create Web Service"**
7. **Wait for deployment** (2-3 minutes)
8. **Your backend URL** will be: `https://habittracker-api.onrender.com`

> **Note**: Render's free tier puts services to sleep after 15 minutes of inactivity. Upgrade to **Render Pro** ($12/month) for always-on service, or keep the free tier for development.

---

## 🔗 Step 4: Connect Frontend & Backend

After both deployments:

1. **Go back to Vercel Dashboard**
2. **Select your frontend project**
3. **Settings** → **Environment Variables**
4. **Update** `VITE_API_URL` to your Render backend URL:
   ```
   VITE_API_URL=https://habittracker-api.onrender.com
   ```
5. **Redeploy**: Click "Deployments" → "Redeploy" on the latest deployment

---

## 🔐 Step 5: Update CORS on Backend

1. Edit [backend/src/server.js](./backend/src/server.js)
2. Update the CORS configuration:
   ```javascript
   const corsOptions = {
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
   };
   
   app.use(cors(corsOptions));
   ```
3. Add `FRONTEND_URL` environment variable in Render:
   ```
   FRONTEND_URL=https://habittracker-app.vercel.app
   ```
4. Push changes:
   ```bash
   git add -A
   git commit -m "Add CORS configuration for production"
   git push origin main
   ```
   - Render will auto-redeploy

---

## ✅ Step 6: Test Your Deployment

1. **Visit your frontend**: https://habittracker-app.vercel.app
2. **Verify it loads** (should show calendar)
3. **Test adding a habit**:
   - Go to "Habits" page
   - Add a new habit
   - Check if it appears on calendar
4. **Check browser console** (F12) for any API errors
5. **If 401 errors**:
   - Verify backend is running (visit https://habittracker-api.onrender.com/health)
   - Check environment variables are correct
   - Ensure Supabase credentials are valid

---

## 🐛 Troubleshooting

### Frontend shows "Failed to fetch"
- ❌ Render backend is sleeping (free tier)
- ✅ Check backend URL is correct in env variables
- ✅ Verify backend CORS allows your Vercel domain

### Backend returns 401 errors
- ❌ `SUPABASE_KEY` or `SUPABASE_URL` is wrong
- ✅ Verify credentials in Supabase dashboard
- ✅ Check `SUPABASE_SERVICE_ROLE_KEY` is set

### Database errors (column not found, etc.)
- ❌ Schema wasn't initialized on Supabase
- ✅ Run [backend/db/supabase_schema.sql](./backend/db/supabase_schema.sql) in Supabase SQL Editor

### Pages not loading, blank screen
- ❌ Frontend was not redeployed after env changes
- ✅ Manually trigger redeploy in Vercel

---

## 💰 Cost Breakdown (Optional)

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Vercel | Hobby | $0 | Free tier is generous |
| Render | Free | $0 | Services sleep after 15 min |
| Render | Pro | $12/month | Always-on backend |
| Supabase | Free | $0 | 500 MB DB, generous limits |
| Total | - | $0-12/month | |

---

## 📊 Monitoring & Scaling

**After deployment, monitor:**

1. **Vercel Analytics**: Dashboard → Analytics tab
2. **Render Logs**: Dashboard → Logs tab
3. **Supabase Dashboard**: Storage, auth users, real-time updates

To improve performance:
- Enable Vercel Edge Functions
- Upgrade Render to Pro for better performance
- Add Supabase indexes for frequently queried columns
- Consider adding a CDN like Cloudflare (free tier)

---

## 🔄 Future Deployments

After deployment, changes are **automatically deployed** when you push to GitHub:

```bash
# Make changes locally
git add -A
git commit -m "Description of changes"
git push origin main

# Vercel & Render automatically redeploy ✨
```

---

## ✨ You're Live!

Your HabitTracker is now live on the internet! Share your deployment URLs with friends:
- **Frontend**: `https://habittracker-app.vercel.app`
- **Backend**: `https://habittracker-api.onrender.com` (keep private)

Happy habit tracking! 🎉
