# Production Deployment Guide

## Prerequisites
- GitHub account (✓ Already have)
- Database hosting service account
- Backend hosting service account  
- Frontend hosting service account

## Step 1: Choose Your Production Database

### Recommended Options:

#### Option A: Railway (Easiest)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Copy the DATABASE_URL from the Connect tab

#### Option B: Supabase (Free tier available)
1. Go to [Supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy the Connection String (URI)

#### Option C: Render (Good free tier)
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. New → PostgreSQL
4. Copy the External Database URL

## Step 2: Deploy Backend API

### Recommended: Render

1. **Create Web Service**
   - Go to [Render.com](https://render.com)
   - New → Web Service
   - Connect your GitHub repository: `Local-Service-Platform`
   - Configure:
     - Name: `local-service-api`
     - Root Directory: `backend`
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`

2. **Add Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<your-postgresql-url>
   JWT_SECRET=<generate-secure-32-char-secret>
   CORS_ORIGIN=<your-frontend-url>
   STRIPE_SECRET_KEY=<your-stripe-key>
   STRIPE_PUBLISHABLE_KEY=<your-stripe-key>
   ```

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your API URL (e.g., `https://local-service-api.onrender.com`)

### Alternative: Railway
- Similar process, connect GitHub repo
- Set root directory to `backend`
- Add environment variables
- Railway will auto-detect Node.js and deploy

## Step 3: Deploy Frontend

### Recommended: Vercel

1. **Deploy to Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import Project → Select `Local-Service-Platform`
   - Configure:
     - Framework Preset: `Create React App`
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `build`

2. **Add Environment Variable**
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `REACT_APP_API_URL=<your-backend-api-url>`
   - Redeploy if needed

3. **Update Frontend API URL**
   - Your frontend will be at: `https://your-app.vercel.app`

### Alternative: Netlify
- Similar process
- Drag and drop `frontend/build` folder after running `npm run build`

## Step 4: Update Backend CORS

After deploying frontend:
1. Go to your backend hosting (Render/Railway)
2. Update environment variable:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
3. Restart the service

## Step 5: Initialize Production Database

Run seed script (one time):
- Option 1: Use Render/Railway's shell/console
- Option 2: Connect locally:
  ```bash
  DATABASE_URL=<production-db-url> npm run seed
  ```

## Step 6: Test Production

1. Visit your frontend URL
2. Test registration
3. Test login with seed data:
   - Customer: `john@example.com` / `password123`
   - Provider: `cleaner@example.com` / `password123`
4. Browse services and providers
5. Create a test booking

## Estimated Costs

### Free Tier Setup:
- **Database**: Railway/Supabase/Render (Free tier)
- **Backend**: Render (Free tier - spins down after inactivity)
- **Frontend**: Vercel/Netlify (Free tier)
- **Total**: $0/month (with limitations)

### Paid Setup (No cold starts):
- **Database**: Railway ($5-10/month)
- **Backend**: Render ($7/month)
- **Frontend**: Free
- **Total**: ~$12-17/month

## Security Checklist

- [ ] Strong JWT_SECRET (32+ characters)
- [ ] Production database credentials secured
- [ ] CORS_ORIGIN set to specific domain (not *)
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] Environment variables in hosting dashboard (not in code)
- [ ] .env files in .gitignore

## Monitoring

- Render provides logs and metrics
- Vercel provides analytics
- Set up error tracking (optional): Sentry.io

## Need Help?

Common issues:
1. **503 errors**: Backend might be cold starting (free tier)
2. **CORS errors**: Check CORS_ORIGIN matches frontend URL
3. **Database connection**: Verify DATABASE_URL and SSL settings
4. **Build failures**: Check Node version compatibility

## Next Steps

1. Set up custom domain (optional)
2. Configure Stripe for real payments
3. Add email notifications
4. Set up monitoring/logging
5. Configure SSL certificates (automatic on most platforms)
