# 📋 Detailed API Specification

## Overview

This document defines the API architecture and contracts for the Keno gaming platform. **No code implementation is provided** — only architecture-level API specifications.

### Design Scope

- ✅ REST APIs for operators and admin
- ✅ WebSocket events for real-time gameplay
- ✅ Wallet integration flows
- ✅ Auditability and security constraints
- ✅ Instant scheduled rounds behavior

---

## 🧩 Core API Groups

The API is organized into **4 main API families**:

1. **Public Game APIs** (player-facing via operator)
2. **Operator Wallet APIs** (debit/credit/rollback)
3. **Admin/Operator Configuration APIs**
4. **Fairness & Verification APIs**

### Transport Protocols

| Protocol | Use Case |
|----------|----------|
| **REST (HTTPS)** | All standard API operations |
| **WebSocket** | Live rounds & results |

### Security

- **Authentication**: OAuth2 / JWT tokens
- **Network Security**: IP allow-listing for operators
- **Request Signing**: HMAC request signatures (recommended)

---

## 🎮 1. Player-Facing Game APIs

> **Note**: These APIs are called by **operator platforms**, not directly by players.

### 🔹 Place Bet

**Endpoint**: `POST /api/v1/game/keno/bet`

#### Request Body

```json
{
  "operatorId": "string",
  "playerId": "string (tokenized by operator)",
  "roundId": "string",
  "stake": "number",
  "numbers": [1-10 selections],
  "currency": "string",
  "betId": "string (from operator)"
}
```

#### Validation Rules

- ✅ Round must be **OPEN**
- ✅ Bet size must be within min/max limits
- ✅ Number selection count must be valid (1-10)
- ✅ Operator config permissions enforced

#### Response

```json
{
  "status": "accepted | rejected",
  "reasonCode": "string",
  "walletDebitReference": "string",
  "roundId": "string"
}
```

---

### 🔹 Get Current Round

**Endpoint**: `GET /api/v1/game/keno/current-round`

#### Response

```json
{
  "roundId": "string",
  "state": "OPEN | LOCKED | DRAWING | COMPLETED",
  "countdownSeconds": "number",
  "commitHash": "string",
  "availableBetOptions": "object",
  "maxPayoutCap": "number"
}
```

**Round States**:
- `OPEN` - Accepting bets
- `LOCKED` - No more bets accepted
- `DRAWING` - Numbers being drawn
- `COMPLETED` - Round finished, results available

---

### 🔹 Get Round Result

**Endpoint**: `GET /api/v1/game/keno/round/{roundId}`

#### Response

```json
{
  "numbersDrawn": [1-20],
  "revealSeed": "string",
  "fairnessVerificationInputs": "object",
  "totalBetVolume": "number",
  "totalPayoutVolume": "number"
}
```

---

### 🔹 Get Player Bet Outcome

**Endpoint**: `GET /api/v1/game/keno/bet/{betId}`

#### Response

```json
{
  "hitCount": "number",
  "payoutMultiplier": "number",
  "winAmount": "number",
  "creditedStatus": "YES | NO",
  "maxWinLimitFlag": "boolean",
  "volatileAdjustmentFlag": "boolean (if applicable)"
}
```

---

## 🔌 2. Wallet Integration APIs (Operator-Side)

### Architecture Note

> **Important**: We **do not hold player balances**. The system calls operator wallet APIs for all financial operations.

### Required Operator Callbacks

The operator must expose the following endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/wallet/debit` | POST | Deduct player balance |
| `/wallet/credit` | POST | Add winnings to player balance |
| `/wallet/rollback` | POST | Reverse a transaction |

### Request Payload

All wallet API calls include:

```json
{
  "operatorId": "string",
  "playerId": "string",
  "transactionId": "string",
  "amount": "number",
  "currency": "string",
  "reasonCode": "string"
}
```

### Requirements

- ✅ **Idempotency keys** required for all operations
- ✅ **Signed requests** for security
- ✅ **Strict timeout & retry rules** enforced

### Rollback Scenarios

Rollback is used when:

- Round cancels
- Technical failure occurs
- Operator requests cancellation before round lock

---

## 🛠 3. Admin & Operator Management APIs

### 🔹 Create Operator

**Endpoint**: `POST /api/v1/admin/operator`

#### Request Body

```json
{
  "companyName": "string",
  "brandLogoUrl": "string",
  "settlementCurrency": "string",
  "contactEmail": "string",
  "regionList": ["string"]
}
```

---

### 🔹 Configure Game Limits

**Endpoint**: `POST /api/v1/operator/config`

#### Configurable Settings

- Min/max bet amounts
- Max win per ticket
- Default language
- Volatility preset
- Enable/disable game

#### Restrictions

**Cannot be changed**:
- ❌ Underlying RTP mathematically
- ❌ RNG draw outcomes

---

### 🔹 Reporting API

**Endpoint**: `GET /api/v1/operator/report/daily`

#### Response

```json
{
  "betVolume": "number",
  "payoutVolume": "number",
  "ggr": "number",
  "rtpActual": "number",
  "topPlayersByVolume": ["object"],
  "suspiciousAccountFlags": ["object"]
}
```

**Report Metrics**:
- **GGR**: Gross Gaming Revenue
- **RTP Actual**: Actual Return to Player percentage

---

## 🧾 4. Provably Fair Verification API

### 🔹 Get Seed Commit for Round

**Endpoint**: `GET /api/v1/fairness/{roundId}/commit`

#### Response

```json
{
  "commitHash": "string (sha256(serverSeed + roundId))"
}
```

The commit hash is published **before** the round draw to ensure fairness.

---

### 🔹 Get Reveal Seed

**Endpoint**: `GET /api/v1/fairness/{roundId}/reveal`

#### Response

```json
{
  "rawSeed": "string",
  "generationProcedure": "string",
  "hashVerificationInstructions": "string"
}
```

The reveal seed is published **after** the round completes.

---

### 🔹 Public Verification Endpoint

**Endpoint**: `GET /api/v1/fairness/verify`

> **Regulator-Critical**: This endpoint allows anyone to verify round fairness.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `commitHash` | string | Original commit hash |
| `revealSeed` | string | Revealed seed |
| `roundNumbers` | array | Numbers drawn in the round |

#### Response

```json
{
  "verified": "boolean",
  "tamperProof": "boolean"
}
```

---

## 📡 WebSocket Live Events

### Connection

**WebSocket URL**: `wss://.../ws/keno`

### Event Types

| Event | Description |
|-------|-------------|
| `ROUND_OPEN` | New round opened, accepting bets |
| `ROUND_LOCKED` | Round locked, no more bets accepted |
| `ROUND_DRAW` | Drawing in progress |
| `ROUND_RESULT` | Round completed, results available |
| `PLAYER_WIN` | Player has won (specific to connected player) |
| `PLAYER_LOSS` | Player has lost (specific to connected player) |

### Client Benefits

- ⚡ **Instant results** - No polling needed
- 📉 **Low bandwidth** - Efficient real-time updates
- 🚫 **Zero polling** - Server pushes updates to clients

---

## 🚨 Error Handling & Codes

### Standardized Error Codes

| Error Code | Description |
|------------|-------------|
| `BET_AFTER_LOCK` | Attempted to place bet after round locked |
| `LIMIT_EXCEEDED` | Bet amount exceeds allowed limits |
| `INVALID_SELECTION_COUNT` | Invalid number of selections (must be 1-10) |
| `INSUFFICIENT_FUNDS` | Player balance insufficient for bet |
| `ROUND_NOT_FOUND` | Requested round does not exist |
| `RNG_SERVICE_UNAVAILABLE` | Random number generation service unavailable |
| `MAX_WIN_CAP_REACHED` | Maximum win limit reached |

> **Requirement**: All errors must include **clear, player-facing messages** in addition to error codes.

---

## Summary

This API specification provides:

- ✅ Complete REST API contracts for all services
- ✅ WebSocket event definitions for real-time gameplay
- ✅ Wallet integration requirements
- ✅ Security and authentication specifications
- ✅ Provably fair verification endpoints
- ✅ Comprehensive error handling standards

All APIs follow RESTful principles and use standard HTTP status codes. WebSocket events provide real-time updates without polling overhead.