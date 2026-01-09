# Keno Game Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **PostgreSQL**: v14+ 
- **npm** or **yarn**

### 1. Clone and Install

```bash
# Navigate to backend directory
cd src/backend

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Create database
createdb keno_game

# Or using psql:
psql -U postgres
CREATE DATABASE keno_game;
```

### 3. Environment Configuration

Create `.env` file in `src/backend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=keno_game

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# Server
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: Redis (for future distributed scheduling)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Run Database Migrations

```bash
# Generate migration (if needed)
npm run migration:generate -- MigrationName

# Run migrations
npm run migration:run
```

### 5. Start Backend Server

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

### 6. Start Frontend (Optional)

```bash
# In a new terminal
cd src/frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 📚 API Documentation

Once the server is running, access Swagger documentation at:

**http://localhost:3000/api-docs**

The Swagger UI provides:
- Interactive API testing
- Request/response schemas
- Authentication testing
- All endpoint documentation

---

## 🧪 Testing

### Run Unit Tests

```bash
cd src/backend
npm test
```

### Run Integration Tests

```bash
# Set up test database first
createdb keno_test

# Update .env.test with test database credentials
npm test -- tests/integration
```

### Run with Coverage

```bash
npm run test:cov
```

---

## 🔧 Development Tools

### Database Migrations

```bash
# Generate new migration
npm run migration:generate -- MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Create empty migration
npm run migration:create -- MigrationName
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Simulation Script

Test game logic without database:

```bash
npm run simulate
```

---

## 🔐 Authentication Setup

### Get JWT Token

```bash
# Login as operator
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "operatorId": "op-1"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "operatorId": "op-1"
}
```

### Use Token in Requests

```bash
curl -X GET http://localhost:3000/admin/rounds \
  -H "Authorization: Bearer <your-token>"
```

---

## 📊 Health Checks

### Basic Health Check

```bash
GET http://localhost:3000/health
```

### Detailed Health Check

```bash
GET http://localhost:3000/health/detailed
```

Returns:
- Service status
- Database connection status
- Memory usage
- Uptime

---

## 🎮 Testing the Game

### 1. Check Current Round

```bash
GET http://localhost:3000/rounds/current
```

### 2. Place a Bet

```bash
POST http://localhost:3000/bets
Content-Type: application/json

{
  "operatorId": "op-1",
  "playerId": "player-1",
  "currency": "USD",
  "stake": 10,
  "selections": [1, 2, 3, 4, 5]
}
```

### 3. Check Bet Status

```bash
GET http://localhost:3000/bets/{betId}
```

### 4. View Round Results

```bash
GET http://localhost:3000/rounds/{roundId}/result
```

---

## 🐛 Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running: `pg_isready`
2. Check credentials in `.env`
3. Ensure database exists: `psql -l | grep keno_game`

### Port Already in Use

```bash
# Change PORT in .env or kill process
lsof -ti:3000 | xargs kill
```

### Migration Errors

```bash
# Check data-source.ts configuration
# Verify entity paths are correct
# Ensure database connection works
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📁 Project Structure

```
keno-game/
├── src/
│   ├── backend/          # NestJS backend
│   │   ├── auth/         # Authentication
│   │   ├── bet/          # Bet management
│   │   ├── common/       # Shared utilities
│   │   ├── database/     # Database config & entities
│   │   ├── fairness/     # Provably fair RNG
│   │   ├── game-engine/  # Core game logic
│   │   ├── gateway/      # WebSocket gateway
│   │   ├── operator/     # Operator management
│   │   ├── payout/       # Payout calculations
│   │   ├── round/        # Round management
│   │   ├── scheduler/    # Round scheduling
│   │   └── wallet/       # Wallet integration
│   └── frontend/         # React frontend
├── tests/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
└── docs/                 # Documentation
```

---

## 🔗 Useful Links

- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Frontend**: http://localhost:5173

---

## 📝 Next Steps

1. **Create Test Operator**: Insert operator and config in database
2. **Enable Authentication**: Uncomment global guard in `app.module.ts`
3. **Configure Production**: Update `.env` with production values
4. **Set Up Monitoring**: Add logging and monitoring tools
5. **Deploy**: Follow deployment documentation

---

## 🆘 Support

For issues or questions:
1. Check the documentation in `/docs`
2. Review error logs
3. Check API documentation at `/api-docs`
4. Review test files for usage examples
