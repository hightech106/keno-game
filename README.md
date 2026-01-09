# 🎰 Keno Game Platform

Enterprise-Grade Virtual Keno Game for Multi-Operator Betting Platform

## 🎯 Overview

A complete, production-ready Keno gaming platform built with NestJS (TypeScript) and React. Features automatic round scheduling, provably fair RNG, real-time WebSocket updates, and comprehensive admin APIs.

## ✨ Features

- ✅ **Automatic Round Scheduling** - 10-second rounds with complete lifecycle
- ✅ **Provably Fair RNG** - HMAC-SHA256 based number generation
- ✅ **Real-time Updates** - WebSocket events for live gameplay
- ✅ **Multi-Operator Support** - Operator isolation and configuration
- ✅ **Complete Bet Flow** - Place → Draw → Settle → Payout
- ✅ **Wallet Integration** - Debit/credit with rollback support
- ✅ **JWT Authentication** - Secure operator authentication
- ✅ **Admin APIs** - Statistics, round explorer, bet management
- ✅ **API Documentation** - Swagger/OpenAPI at `/api-docs`
- ✅ **Audit Logging** - Complete audit trail for compliance

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Installation

```bash
# Backend
cd src/backend
npm install

# Create .env file (see SETUP_GUIDE.md)
# Run migrations
npm run migration:run

# Start server
npm run start:dev
```

```bash
# Frontend (optional)
cd src/frontend
npm install
npm run dev
```

### Access Points

- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **Frontend**: http://localhost:5173

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## 📚 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Complete setup instructions
- [API Documentation](http://localhost:3000/api-docs) - Interactive Swagger docs
- [Project Requirements](./docs/Project%20Requirement.md) - Full requirements
- [Development Roadmap](./docs/Full%20development%20roadmap%20&%20milestones.md) - Phased development plan
- [API Specifications](./docs/api/) - Detailed API specs

## 🏗️ Architecture

### Backend (NestJS)

```
src/backend/
├── auth/          # JWT authentication
├── bet/           # Bet placement & management
├── common/        # Shared utilities, error handling
├── database/       # TypeORM entities & migrations
├── fairness/       # Provably fair RNG
├── game-engine/    # Core game logic
├── gateway/        # WebSocket gateway
├── operator/       # Operator management
├── payout/         # Payout calculations
├── round/          # Round lifecycle
├── scheduler/      # Automatic scheduling
└── wallet/         # Wallet integration
```

### Frontend (React + Vite)

```
src/frontend/
├── components/     # React components
├── context/        # WebSocket context
└── services/       # API service
```

## 📊 API Endpoints

### Public Endpoints

- `GET /rounds/current` - Get current round
- `GET /rounds/:roundId/result` - Get round results
- `GET /fairness/verify` - Verify round fairness
- `POST /auth/login` - Operator login
- `GET /health` - Health check

### Protected Endpoints (JWT Required)

- `POST /bets` - Place bet
- `GET /bets/:betId` - Get bet status
- `POST /bets/rollback` - Rollback bet
- `GET /admin/rounds` - Get recent rounds
- `GET /admin/stats` - Get statistics
- `GET /admin/bets` - Get recent bets

### WebSocket

- `WS /game` - Real-time round updates

See [API Documentation](http://localhost:3000/api-docs) for complete details.

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
cd src/backend
npm test -- tests/integration

# Coverage
npm run test:cov
```

## 📈 Project Status

**Overall Completion: ~85%**

- ✅ Phase 1: Core Game Engine (100%)
- ✅ Phase 2: RNG & Fairness (100%)
- ✅ Phase 3: Wallet & Operator Layer (95%)
- ✅ Phase 4: Frontend & Real-time (85%)
- ⚠️ Phase 5: Admin Backoffice (30% - APIs done, UI pending)
- ⚠️ Phase 6: Testing (60% - Unit & Integration done)
- ⚠️ Phase 7: Certification (0%)

## 🔒 Security Features

- JWT authentication
- Standardized error codes
- Audit logging
- Request ID tracking
- Input validation
- CORS configuration

## 📝 License

Private - Unlicensed

## 🗺️ Development Roadmap

See [Full Development Roadmap](./docs/Full%20development%20roadmap%20&%20milestones.md) for detailed phases and milestones.

## 🆘 Support

- Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for setup help
- Review API docs at `/api-docs`
- Check documentation in `/docs` folder

---

**Built with ❤️ using NestJS, React, TypeScript, and PostgreSQL**
