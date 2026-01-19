# ServiceHub AI Coding Guidelines

## Project Overview
ServiceHub is a marketplace connecting customers with local service providers (cleaning, lawn care, plumbing, etc.). It's a monorepo with separate backend (Express/TypeScript/Sequelize) and frontend (React/TypeScript/Tailwind) applications.

## Architecture & Data Flow

### Core Business Model
- **Customers**: Browse/book services, leave reviews
- **Providers**: Pay $29/month subscription, manage bookings, receive payments (90% after commission)
- **Admin**: Oversee platform, handle disputes, process payments

### Database Architecture
- **Sequelize ORM** with SQLite (dev) and PostgreSQL (prod)
- **Model relationships** are defined centrally in `backend/src/models/index.ts`
- Key models: `User`, `ProviderProfile`, `Booking`, `Review`, `SubscriptionPlan`, `PaymentAdjustment`, `Notification`
- Associations use explicit aliases: `bookingsAsCustomer`, `bookingsAsProvider`, `reviewsGiven`, `reviewsReceived`

### Critical Request Flow
1. Frontend axios instance (`frontend/src/services/api.ts`) adds JWT to all requests via interceptor
2. Backend auth middleware (`backend/src/middleware/auth.middleware.ts`) validates JWT and attaches `req.user`
3. Controllers access `(req as any).user.id` for authenticated operations
4. Role-based access uses `authorize(...roles)` middleware after `authenticate`

### Stripe Integration Pattern
**CRITICAL**: The Stripe webhook route MUST be registered BEFORE `express.json()` middleware in `backend/src/server.ts`:
```typescript
app.post('/api/subscriptions/webhook', express.raw({ type: 'application/json' }), SubscriptionController.handleWebhook);
// THEN register body parsers
app.use(express.json());
```
This is because Stripe requires raw body for signature verification.

## Development Workflows

### Local Setup
```bash
npm run install:all          # Install all dependencies
cd backend && npm run seed   # Initialize database with sample data
npm run dev                  # Start both servers (backend:5000, frontend:3000)
```

### Database Operations
- **Never use `sequelize.sync({ force: true })`** in production - it deletes all data
- Manual seeding: POST to `/api/seed/initialize` (disabled auto-seed to prevent data loss)
- Migrations: SQL files in `backend/migrations/` run via `node run-migration.js` during deployment
- Check database: Use scripts in `backend/src/scripts/` (e.g., `checkProviders.ts`, `resetDatabase.ts`)

### Building & Deployment
- Backend builds TypeScript to `dist/`: `npm run build` (runs automatically in `postinstall`)
- Production uses `npm start` which runs `node dist/server.js`
- Deployment configs: `render.yaml` (for Render.com), `DEPLOYMENT.md` (multi-platform guide)

## Code Conventions

### TypeScript Patterns
- **Controllers**: Static methods, use `Response` type, avoid `return` after `res.json()` (void functions)
- **Models**: Sequelize models with TypeScript interfaces, define associations in `models/index.ts`
- **Routes**: Express Router pattern, group by resource (auth, bookings, providers, etc.)
- **Middleware**: Custom `AuthRequest` interface extends Express `Request` with `user` property

### Authentication & Authorization
```typescript
// In routes
router.get('/profile', authenticate, getProfile);
router.post('/admin', authenticate, authorize('admin'), adminAction);

// In controllers
const userId = (req as any).user.id;
const userRole = (req as any).user.role;
```

### Error Handling
- Use global error middleware in `backend/src/middleware/error.middleware.ts`
- Frontend axios interceptor handles 401s by clearing tokens and redirecting to `/login`
- Controllers return explicit status codes: 404 (not found), 403 (forbidden), 401 (unauthorized)

### Environment Variables
- Backend: `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `STRIPE_SECRET_KEY`
- Frontend: `REACT_APP_API_URL` (defaults to `http://localhost:5000/api`)
- Development vs Production: Check `process.env.NODE_ENV === 'production'`

## Key Files & Their Roles

- `backend/src/server.ts` - Express app setup, **ORDER MATTERS**: Stripe webhook before body parsers
- `backend/src/models/index.ts` - Single source of truth for all Sequelize associations
- `backend/src/config/database.ts` - Sequelize instance with conditional PostgreSQL SSL for production
- `frontend/src/context/AuthContext.tsx` - Global auth state, localStorage persistence
- `backend/src/scripts/seed.ts` - Creates subscription plans, service categories, sample users
- `render.yaml` - Infrastructure-as-code for Render.com deployment

## Common Pitfalls

1. **Webhook body parsing**: Always register Stripe webhooks before `express.json()`
2. **Model sync**: Use `{ force: false }` to avoid data deletion
3. **Association aliases**: Use exact aliases from `models/index.ts` (e.g., `include: [{ model: User, as: 'customer' }]`)
4. **JWT secret**: Must be set in production, defaults to 'secret' in dev (insecure)
5. **CORS**: Frontend must be added to `CORS_ORIGIN` env var in production
6. **Database migrations**: Run `node run-migration.js` after deployment to apply schema changes

## Testing & Debugging

- Health check: GET `/health` returns server status
- View all users: GET `/api/auth/users` (debug endpoint)
- Check Stripe subscription: Scripts in `backend/` root: `check-subscription.js`, `check-plans.js`
- Reset data: `npm run seed` (backend) or POST `/api/seed/initialize` (API)

## Subscription & Payment Logic

- Free plans: No Stripe checkout, activate directly in `SubscriptionController`
- Paid plans: Create Stripe checkout session, redirect user, handle webhook to activate
- Commission structure: Stored per plan in `SubscriptionPlan.commissionRate` (8-10%)
- Payment adjustments: Track in `PaymentAdjustment` model linked to bookings
