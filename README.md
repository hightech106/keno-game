# 🎰 Keno Game Platform

Enterprise-Grade Virtual Keno Game for Multi-Operator Betting Platform

## 📋 Project Status

**Phase 1: Core Game Engine** - ✅ In Progress

This project is currently in Phase 1 implementation. See the development roadmap for details.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
```

### Database Setup

```bash
# Create PostgreSQL database
createdb keno_game

# Run migrations (once implemented)
npm run migration:run
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### Running Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## 📁 Project Structure

```
keno-game/
├── src/
│   ├── backend/          # Node.js server code (NestJS)
│   │   ├── common/       # Shared utilities and enums
│   │   ├── config/       # Configuration services
│   │   ├── database/     # Database entities and configuration
│   │   ├── game-engine/  # Core game logic
│   │   ├── payout/       # Payout calculation
│   │   ├── round/        # Round management
│   │   ├── scheduler/    # Round scheduling
│   │   ├── app.module.ts # Root module
│   │   └── main.ts       # Application entry point
│   ├── frontend/         # Frontend application (Phase 4)
│   ├── shared/           # Shared TypeScript types
│   └── scripts/          # Build/deployment scripts
├── docs/
│   ├── api/              # API documentation
│   ├── math/             # Mathematical documentation
│   ├── deployment/       # Deployment guides
│   └── compliance/       # Regulatory documentation
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── simulation/       # RTP simulation tests
├── locales/              # Language files
└── tools/                # Admin/operator tools
```

## 🎯 Phase 1 Deliverables

- ✅ **Number Draw Engine** - Generate 1–80 unique numbers
- ✅ **Hit Detection Logic** - Calculate matching numbers
- ✅ **Payout Table Implementation** - Apply payout multipliers
- ✅ **Maximum Win Limits** - Configurable win caps
- ✅ **Round Lifecycle State Machine** - State transitions (OPEN → LOCKED → DRAWING → COMPLETED)
- ✅ **Scheduled Automatic Rounds** - 10-second default interval
- ✅ **Configuration Management** - Game settings and limits
- ✅ **Local Simulation** - Test game logic without database

**Status**: ✅ Phase 1 Complete - Core game engine functional!

## 🧪 Testing

The project uses Jest for testing. Core game logic has unit tests with coverage targets:

- Number Draw Engine
- Hit Detection Service
- Payout Table Service
- Payout Calculation Service
- Round Lifecycle Service

Run tests with: `npm test`

## 📚 Documentation

See the `/docs` folder for comprehensive documentation:

- Project Requirements
- API Specifications
- Database Schema
- Architecture Design
- Testing Strategy

## 🔧 Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: NestJS
- **Database**: PostgreSQL (TypeORM)
- **Testing**: Jest
- **Scheduling**: @nestjs/schedule

## 📝 License

Private - Unlicensed

## 👥 Team

See development roadmap for team recommendations.

## 🗺️ Next Steps

1. Complete Phase 1 implementation
2. Add integration tests
3. Set up Redis for distributed scheduling
4. Begin Phase 2: RNG & Fairness
