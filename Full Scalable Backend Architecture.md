# 🏗️ Full Scalable Backend Architecture

## Overview

The platform uses a **microservice-style modular architecture** rather than a monolithic structure. This enables better scalability, maintainability, and independent deployment of services.

---

## System Components

### Core Services

#### 1. **API Gateway**
- Single entry point for all client requests
- Routes requests to appropriate microservices
- Handles load balancing and rate limiting

#### 2. **Auth & Session Service**
- User authentication and authorization
- Session management
- Token generation and validation

#### 3. **Game Engine Service (Keno Core)**
- Core game logic and bet processing
- Handles game rules and payout calculations

#### 4. **RNG & Blockchain Fairness Service**
- Random number generation
- Provably fair system implementation
- Blockchain integration for transparency

#### 5. **Round Scheduler Service**
- Manages round timing and scheduling
- Coordinates round lifecycle events

#### 6. **Wallet / Transaction Service**
- Handles player balances
- Processes deposits and withdrawals
- Manages financial transactions

#### 7. **Reporting & Logs Service**
- Generates reports and analytics
- Centralized logging system
- Audit trail management

#### 8. **Admin & Operator Portal Service**
- Backend for administrative interfaces
- Operator configuration and management

#### 9. **Notification / WebSocket Service**
- Real-time communication
- Push notifications
- WebSocket connections for live updates

---

## Communication Protocols

| Use Case | Protocol |
|----------|----------|
| Admin & Configuration | REST API |
| Live Rounds & Results | WebSocket |
| Internal Service Communication | Message Queue (Kafka/RabbitMQ) |

---

## Technology Stack

### Backend Framework
- **Runtime**: Node.js
- **Language**: TypeScript (strongly recommended)
- **Framework**: NestJS (preferred) or Express

### Database
- **Primary DB**: PostgreSQL (transactional data)
- **Cache/Sessions**: Redis (caching, sessions, rate limits)
- **Analytics**: ClickHouse or BigQuery (for logs and analytics at scale)

### Message Queue
- **Preferred**: Kafka
- **Alternative**: RabbitMQ

### Blockchain
- **Libraries**: Web3.js or similar
- **Protocol**: Commit–reveal hashing scheme

### Infrastructure
- **Load Balancer**: Nginx or cloud-based load balancer
- **Containerization**: Docker
- **Orchestration**: Kubernetes (K8s)

---

## Game Engine Service (Keno Core)

### Responsibilities

1. **Bet Validation**
   - Validates player bets before processing
   - Checks betting limits and rules

2. **Seed Management**
   - Generates commit seed hash for upcoming rounds
   - Receives reveal seed from RNG service

3. **Draw Generation**
   - Generates 20 draw numbers per round
   - Ensures fair and random selection

4. **Payout Calculation**
   - Calculates wins using payout tables
   - Returns outcome to player

5. **Results & Logging**
   - Sends results to logs service
   - Creates blockchain proof for transparency

### Hard Rules Enforced

- ✅ **No per-player manipulation** - All players have equal odds
- ✅ **Fixed RTP payout mathematics** - Consistent return-to-player rates
- ✅ **Max win enforcement** - Caps on maximum winnings
- ✅ **Certified RNG only** - Uses approved random number generation

> **Important**: This service must never depend on the UI layer.

---

## RNG & Blockchain Fairness Service

### Implementation Details

#### Features
- Round seed generation
- Commit hash storage
- Reveal seed publishing
- Provably fair verification API

#### Default Approach
- **Seed System**: Server seed (client seed option planned for future)
- **Hashing**: SHA-256
- **Blockchain**: Ethereum or similar blockchain anchor
  - Optional in v1
  - Planned for v2

### Workflow

```
1. Seed Generated
   ↓
2. Hash Committed & Published (before draw)
   ↓
3. Round Completes
   ↓
4. Reveal Seed Published
   ↓
5. Verification Algorithm (publicly accessible)
```

---

## Scheduled Round Engine

### Configuration

- **Default**: New round every **5 seconds**
- **Range**: Configurable between **2–60 seconds**
- **Processing**: Batch processed bets per round

### Implementation Strategy

#### Distributed Scheduler
Uses one of the following approaches:
- **Redis locks** for leader election
- **Kubernetes cron jobs** for scheduling

#### Critical Requirements

- ✅ Only **one scheduler active at a time** (prevents double rounds)
- ✅ **Leader election mechanism** for failover
- ✅ **Missed round recovery** capability
- ✅ **Duplicate prevention tokens** to avoid conflicts

---

## Performance & Scalability Plan

### Target
Support **millions of rounds per day**.

### Scalability Strategy

#### Stateless Architecture
- Stateless API nodes for horizontal scaling
- Horizontal autoscaling based on load
- CDN for asset delivery

#### Caching Strategy (Redis)
Cache frequently accessed data:
- Translations
- Payout tables
- Operator configuration

> Avoid heavy database usage during gameplay to maintain performance.

#### Performance Optimization

**Hot Paths** (optimized for speed):
- Betting operations
- Round settlement
- Wallet debit/credit operations

**Cold Paths** (async processing):
- Email notifications
- Report generation
- AML checks
- Analytics aggregation

---

## Security & Anti-Fraud Layer

### Security Measures

- **Authentication**: JWT with token rotation
- **Rate Limiting**: Per IP/device basis
- **Bot Detection**: Heuristic-based detection system
- **API Security**: Signature verification on all API calls
- **Betting Rules**: "Cannot bet after round lock" enforcement
- **Rollback**: Wallet API supports rollback procedures

### Encryption
All sensitive traffic encrypted with **TLS 1.3**.

---

## Database Schema (High Level)

### Key Tables

| Table | Purpose |
|-------|---------|
| `players` | Player accounts and profiles |
| `operators` | Operator configurations |
| `bets` | Player bet records |
| `rounds` | Round information and results |
| `payouts` | Payout calculations and records |
| `wallet_transactions` | All financial transactions |
| `rng_seeds` | RNG seeds and proofs |
| `audit_logs` | System audit trail |
| `admin_actions` | Administrative action logs |

> **Important**: All round results are **immutable** once created.

---

## Summary

This architecture provides:
- ✅ Scalable microservice design
- ✅ High performance for millions of rounds/day
- ✅ Provably fair gaming system
- ✅ Robust security and anti-fraud measures
- ✅ Flexible deployment with Docker and Kubernetes