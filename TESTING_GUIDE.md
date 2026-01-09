# 🧪 Testing Guide - Keno Game Platform

## 🚀 Quick Start Testing

### Step 1: Verify Prerequisites

```bash
# Check Node.js version (should be 18+)
node --version

# Check PostgreSQL is running
pg_isready
# OR on Windows:
# Check PostgreSQL service is running in Services
```

### Step 2: Install Dependencies

```bash
# Backend
cd src/backend
npm install

# Frontend (if testing UI)
cd ../../src/frontend
npm install
```

### Step 3: Database Setup

```bash
# Create database (if not exists)
createdb keno_game

# Or using psql:
psql -U postgres -c "CREATE DATABASE keno_game;"
```

### Step 4: Environment Configuration

Ensure `.env` file exists in `src/backend/` with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=keno_game

JWT_SECRET=test-secret-key-change-in-production
JWT_EXPIRES_IN=1h

PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Step 5: Run Migrations

```bash
cd src/backend
npm run migration:run
```

### Step 6: Start Backend Server

```bash
cd src/backend
npm run start:dev
```

**Expected Output:**
```
🎰 Keno Game Platform (Backend) running on: http://localhost:3000
📚 API Documentation available at: http://localhost:3000/api-docs
```

---

## ✅ Testing Checklist

### 1. Health Checks

#### Basic Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "keno-game-platform",
  "version": "1.0.0"
}
```

#### Detailed Health Check
```bash
curl http://localhost:3000/health/detailed
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "service": "keno-game-platform",
  "version": "1.0.0",
  "database": {
    "status": "connected",
    "type": "postgresql"
  },
  "uptime": 123.45,
  "memory": {
    "used": 45,
    "total": 128,
    "unit": "MB"
  }
}
```

✅ **Check:** Database status should be "connected"

---

### 2. API Documentation (Swagger)

**Open in Browser:**
```
http://localhost:3000/api-docs
```

**Test:**
- ✅ Swagger UI loads
- ✅ All endpoints visible
- ✅ Can expand endpoint details
- ✅ Try "Authorize" button (JWT auth)
- ✅ Test endpoints directly from UI

---

### 3. Round Endpoints

#### Get Current Round
```bash
curl http://localhost:3000/rounds/current
```

**Expected Response:**
```json
{
  "roundId": "ROUND-...",
  "status": "OPEN",
  "scheduledTime": "2024-01-01T12:00:00.000Z",
  "countdownSeconds": 8,
  "serverSeedHash": "...",
  "numbersDrawn": [],
  "totalBet": 0,
  "totalPayout": 0
}
```

✅ **Check:**
- Round ID exists
- Status is "OPEN"
- Countdown decreases
- Server seed hash present

#### Get Round by ID
```bash
# Use roundId from previous response
curl http://localhost:3000/rounds/ROUND-123
```

✅ **Check:** Returns round details

#### Get Round Result (after round completes)
```bash
curl http://localhost:3000/rounds/ROUND-123/result
```

✅ **Check:** Returns drawn numbers and results

---

### 4. Bet Placement

#### Place a Bet
```bash
curl -X POST http://localhost:3000/bets \
  -H "Content-Type: application/json" \
  -d '{
    "operatorId": "op-1",
    "playerId": "player-1",
    "currency": "USD",
    "stake": 10.0,
    "selections": [1, 2, 3, 4, 5]
  }'
```

**Expected Response:**
```json
{
  "betId": "BET-...",
  "roundId": "ROUND-...",
  "status": "PENDING",
  "betAmount": 10.0,
  "selectionCount": 5,
  "numbersSelected": [1, 2, 3, 4, 5]
}
```

✅ **Check:**
- Bet ID generated
- Round ID matches current round
- Status is "PENDING"
- Bet amount correct

#### Get Bet Status
```bash
# Use betId from previous response
curl http://localhost:3000/bets/BET-123
```

✅ **Check:** Returns bet details with status

---

### 5. Round Lifecycle (Automatic)

**Wait 10 seconds and observe:**

1. **Round Status Changes:**
   - OPEN → CLOSING → DRAWING → SETTLING → PAYOUT → ARCHIVED

2. **Check Round Result:**
   ```bash
   curl http://localhost:3000/rounds/ROUND-123/result
   ```
   ✅ **Check:** Numbers drawn (20 numbers)

3. **Check Bet Status:**
   ```bash
   curl http://localhost:3000/bets/BET-123
   ```
   ✅ **Check:**
   - `hitsCount` calculated
   - `winAmount` calculated (if hits > 0)
   - `credited` becomes true
   - Status changes to "WIN" or "LOST"

---

### 6. Fairness Verification

#### Verify Round Fairness
```bash
# Get round details first
curl http://localhost:3000/rounds/ROUND-123

# Then verify (use values from round)
curl "http://localhost:3000/fairness/verify?serverSeed=...&clientSeed=...&nonce=1"
```

**Expected Response:**
```json
{
  "success": true,
  "inputs": {
    "serverSeed": "...",
    "serverSeedHash": "...",
    "clientSeed": "...",
    "nonce": 1
  },
  "result": {
    "numbers": [1, 2, 3, ...]
  }
}
```

✅ **Check:**
- Numbers match round's drawn numbers
- Server seed hash matches round's hash

---

### 7. Authentication (JWT)

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "operatorId": "op-1"
  }'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "operatorId": "op-1"
}
```

#### Use Token for Protected Endpoint
```bash
# Save token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Test admin endpoint
curl http://localhost:3000/admin/rounds \
  -H "Authorization: Bearer $TOKEN"
```

✅ **Check:** Returns rounds list

---

### 8. Admin Endpoints (Requires JWT)

#### Get Recent Rounds
```bash
curl http://localhost:3000/admin/rounds?limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

#### Get Statistics
```bash
curl http://localhost:3000/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "totalRounds": 100,
  "totalBets": 500,
  "totalBetAmount": 5000.0,
  "totalPayout": 4500.0,
  "ggr": 500.0,
  "rtp": 0.90
}
```

✅ **Check:** Statistics calculated correctly

---

### 9. WebSocket Connection (Real-time)

#### Test with Browser Console

1. Open browser console on frontend (http://localhost:5173)
2. Check WebSocket connection in Network tab
3. Observe real-time events:
   - `round_state_change`
   - `round_completed`
   - `numbers_drawn`

#### Test with curl (limited - use frontend or ws client)

```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:3000/game
```

✅ **Check:** Receives round updates

---

### 10. Frontend Testing

#### Start Frontend
```bash
cd src/frontend
npm run dev
```

**Open:** http://localhost:5173

**Test:**
- ✅ Page loads
- ✅ Current round displays
- ✅ Countdown timer works
- ✅ Status indicators show correct colors
- ✅ Can place bets
- ✅ WebSocket connection shows as connected
- ✅ Real-time updates work

---

## 🐛 Common Issues & Solutions

### Issue: Database Connection Error

**Error:** `Connection refused` or `password authentication failed`

**Solution:**
1. Check PostgreSQL is running
2. Verify `.env` credentials
3. Test connection:
   ```bash
   psql -U postgres -d keno_game -c "SELECT 1;"
   ```

### Issue: Migration Errors

**Error:** `Migration failed` or `table already exists`

**Solution:**
```bash
# Check migration status
# If needed, drop and recreate database
dropdb keno_game
createdb keno_game
npm run migration:run
```

### Issue: Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Find and kill process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill
```

### Issue: Module Not Found

**Error:** `Cannot find module '@nestjs/swagger'`

**Solution:**
```bash
cd src/backend
npm install
```

### Issue: WebSocket Not Connecting

**Check:**
1. Backend is running
2. CORS allows frontend origin
3. WebSocket gateway is initialized
4. Check browser console for errors

---

## 📊 Test Results Template

```
✅ Health Checks: PASS
✅ API Documentation: PASS
✅ Round Endpoints: PASS
✅ Bet Placement: PASS
✅ Round Lifecycle: PASS
✅ Fairness Verification: PASS
✅ Authentication: PASS
✅ Admin Endpoints: PASS
✅ WebSocket: PASS
✅ Frontend: PASS
```

---

## 🎯 Automated Testing

### Run Unit Tests
```bash
cd src/backend
npm test
```

### Run Integration Tests
```bash
# Ensure test database exists
createdb keno_test

# Run integration tests
npm test -- tests/integration
```

### Run with Coverage
```bash
npm run test:cov
```

---

## 📝 Notes

- **Development Mode:** JWT guard is disabled (commented out in `app.module.ts`)
- **Test Data:** Create test operator and config in database for full testing
- **Round Duration:** Default is 10 seconds (configurable)
- **WebSocket:** Best tested through frontend UI

---

## 🎉 Success Criteria

All tests pass when:
- ✅ All endpoints return expected responses
- ✅ Round lifecycle completes automatically
- ✅ Bets are settled correctly
- ✅ WebSocket provides real-time updates
- ✅ Frontend displays data correctly
- ✅ No errors in console/logs
