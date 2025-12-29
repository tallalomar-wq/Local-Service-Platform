# Deploy to Render

## Step 1: Deploy Backend to Render

### Create New Web Service
1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `tallalomar-wq/Local-Service-Platform`
4. Configure the service:
   - **Name**: `local-service-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter

### Environment Variables (Backend)
Add these in Render dashboard under "Environment":

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-render-postgres-url>
JWT_SECRET=<generate-secure-random-string>
CORS_ORIGIN=<your-frontend-url>
FRONTEND_URL=<your-frontend-url>

# Stripe Keys (Production)
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Service (Choose one)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Or Gmail
# EMAIL_SERVICE=gmail
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-password

# SMS (Twilio)
SMS_MODE=production
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Create PostgreSQL Database
1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `local-service-db`
3. Region: Same as backend
4. Instance Type: Free or Starter
5. Copy the **Internal Database URL**
6. Add it as `DATABASE_URL` in backend environment variables

### Run Database Migration
After deployment:
1. Go to backend service **"Shell"** tab
2. Run: `npm run seed` (to seed initial data)

---

## Step 2: Deploy Frontend

### Option A: Vercel (Recommended)
1. Go to https://vercel.com/
2. Click **"Add New"** → **"Project"**
3. Import: `tallalomar-wq/Local-Service-Platform`
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. **Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-backend.onrender.com/api
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here
   ```
6. Click **"Deploy"**

### Option B: Render Static Site
1. In Render, click **"New +"** → **"Static Site"**
2. Connect repository
3. Configure:
   - **Name**: `local-service-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. **Environment Variables**: Same as above
5. Click **"Create Static Site"**

---

## Step 3: Configure Stripe Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. Endpoint URL: `https://your-backend.onrender.com/api/subscriptions/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy **Signing Secret** (whsec_...)
6. Add to backend environment as `STRIPE_WEBHOOK_SECRET`

---

## Step 4: Create Live Stripe Products

1. Go to https://dashboard.stripe.com/products
2. Create **Basic Plan**:
   - Name: Basic Plan
   - Price: $29.00 USD
   - Billing: Monthly recurring
   - Copy Price ID (price_...)
3. Create **Pro Plan**:
   - Name: Pro Plan  
   - Price: $49.00 USD
   - Billing: Monthly recurring
   - Copy Price ID (price_...)
4. Update database with live price IDs:
   - Connect to Render backend shell
   - Update subscription_plans table with new price IDs

---

## Step 5: Final Checks

✅ Backend is running on Render
✅ PostgreSQL database is connected
✅ Frontend is deployed (Vercel/Render)
✅ Environment variables are set
✅ Stripe webhooks configured
✅ Live Stripe products created
✅ Database seeded with initial data

---

## Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify DATABASE_URL is correct
- Ensure all required env variables are set

### Frontend can't connect to backend
- Verify REACT_APP_API_URL is correct
- Check CORS_ORIGIN in backend matches frontend URL
- Ensure backend is running

### Stripe payments not working
- Verify using live keys (sk_live_, pk_live_)
- Check webhook is receiving events
- Verify STRIPE_WEBHOOK_SECRET is correct

### Database errors
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- Run migrations/seed in Render shell
