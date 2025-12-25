# Local Service Booking Platform

A marketplace platform connecting customers with local service providers (cleaning, lawn care, plumbing, handyman, etc.).

## Features

### For Customers
- Browse local service providers
- View provider profiles, ratings, and reviews
- Book appointments with calendar integration
- Track booking history
- Leave reviews and ratings

### For Service Providers
- Dashboard with bookings and earnings
- Manage availability and schedule
- Accept/decline service requests
- Customer management
- Payment tracking
- $29/month subscription

### For Admin
- Manage providers and customers
- Approve new service providers
- Handle disputes
- Analytics dashboard
- Payment processing (10% commission)

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Sequelize ORM
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT
- **Payments**: Stripe integration

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/tallalomar-wq/local-service-platform.git
cd local-service-platform
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up environment variables

Backend `.env`:
```
PORT=5000
DATABASE_URL=sqlite:./local_service.db
JWT_SECRET=your-secret-key-change-in-production
CORS_ORIGIN=http://localhost:3000
STRIPE_SECRET_KEY=your-stripe-key
```

4. Run database migrations
```bash
cd backend
npm run seed
```

5. Start the development servers
```bash
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Project Structure

```
local-service-platform/
├── backend/
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Authentication, error handling
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── scripts/       # Database seed scripts
│   │   └── server.ts      # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service calls
│   │   └── App.tsx
│   └── package.json
└── package.json

```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Services
- `GET /api/services` - Get all service categories
- `GET /api/services/:id` - Get service details

### Providers
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get provider details
- `POST /api/providers` - Create provider profile (auth required)
- `PUT /api/providers/:id` - Update provider profile (auth required)

### Bookings
- `GET /api/bookings` - Get user bookings (auth required)
- `POST /api/bookings` - Create new booking (auth required)
- `PUT /api/bookings/:id` - Update booking status (auth required)
- `DELETE /api/bookings/:id` - Cancel booking (auth required)

### Reviews
- `GET /api/reviews/provider/:id` - Get provider reviews
- `POST /api/reviews` - Create review (auth required)

## License

MIT License - see LICENSE file for details
