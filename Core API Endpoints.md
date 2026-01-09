# Core API Endpoints (Operator Gateway)

## Overview

This document describes the external Operator Integration API required for enterprise-grade Virtual Keno. It is designed for sportsbook and casino platforms, wallet providers, and aggregators to integrate with the game engine in a secure, scalable, and auditable manner.

The API supports:

* Scheduled automatic rounds
* Instant results
* Wallet debit/credit flows
* Round and bet management
* Rollbacks for financial safety
* WebSocket live event streaming

All endpoints are stateless and operator-agnostic.

---

## Authentication & Security

### Mechanisms

* OAuth2 or JWT-based operator authentication
* HMAC signature per request body
* TLS/HTTPS mandatory
* Operator IP allowlisting

### Required Headers

* `X-OPERATOR-ID`
* `X-SIGNATURE`
* `Authorization: Bearer <token>`

### Signature Definition

HMAC-SHA256 over:

```
<timestamp>|<operatorId>|<payload>
```

---

## Endpoint Summary

| Category  | Endpoint                 | Method | Description                          |
| --------- | ------------------------ | ------ | ------------------------------------ |
| Rounds    | /rounds/current          | GET    | Retrieve current open round          |
| Rounds    | /rounds/{roundId}/result | GET    | Retrieve round results               |
| Bets      | /bets/place              | POST   | Place a bet for current round        |
| Bets      | /bets/{betId}            | GET    | Get bet status and settlement        |
| Bets      | /bets/rollback           | POST   | Reverse and cancel previous bet      |
| Wallet    | /wallet/debit            | POST   | Operator wallet debit callback       |
| Wallet    | /wallet/credit           | POST   | Operator wallet credit callback      |
| WebSocket | /ws                      | GET    | Real-time round and result streaming |

---

# 1. Get Current Round

**Endpoint**

```
GET /rounds/current
```

**Description**
Returns the currently open betting round and closing/draw time.

**Response**

```
{
  "roundId": "20260109-123456",
  "status": "OPEN",
  "closeTime": 1736423456,
  "drawTime": 1736423466
}
```

---

# 2. Place Bet

**Endpoint**

```
POST /bets/place
```

**Request Body**

```
{
  "roundId": "20260109-123456",
  "playerId": "A67382",
  "operatorId": "OP-882",
  "selection": [3, 12, 27, 35],
  "stake": 2.00,
  "gameType": "pick4"
}
```

### Validation Rules

* round must be OPEN
* stake within operator configured limits
* 1–10 numbers allowed
* numbers range 1–80
* no duplicate numbers
* maximum win limit enforced
* anti-duplicate transaction hash check

**Response**

```
{
  "betId": "BET-889234",
  "status": "ACCEPTED",
  "potentialWin": 160.00
}
```

---

# 3. Get Round Result

**Endpoint**

```
GET /rounds/{roundId}/result
```

**Response**

```
{
  "roundId": "20260109-123456",
  "numbers": [3, 12, 18, 21, 27, 35, 44, 52, 61, 77, 4, 9, 14, 26, 31, 40, 48, 57, 66, 72],
  "status": "SETTLED"
}
```

---

# 4. Get Bet Result

**Endpoint**

```
GET /bets/{betId}
```

**Response**

```
{
  "betId": "BET-889234",
  "roundId": "20260109-123456",
  "status": "WIN",
  "matched": 4,
  "winAmount": 160.00
}
```

---

# 5. Rollback Bet

**Endpoint**

```
POST /bets/rollback
```

**Purpose**
Used for regulatory compliance and financial safety when:

* wallet debit fails
* timeout occurs
* network errors
* duplicate transaction detected

**Request**

```
{
  "betId": "BET-889234",
  "reason": "WALLET_TIMEOUT"
}
```

**Response**

```
{
  "status": "ROLLED_BACK"
}
```

---

# 6. Wallet Callbacks

Your game engine is walletless; operator wallet holds balances.

## Debit Callback

```
POST /wallet/debit
```

Request from game service to operator system.

## Credit Callback

```
POST /wallet/credit
```

Triggered after settlement.

---

# 7. WebSocket Real-Time Events

Endpoint:

```
GET /ws
```

### Event Types

* ROUND_OPEN
* ROUND_CLOSE
* ROUND_RESULT
* BET_RESULT

### Example Event

```
ROUND_RESULT
{
  "roundId": "20260109-123456",
  "numbers": [3, 12, 18, 21, 27, 35]
}
```

---

# Error Codes

| Code               | Meaning                         |
| ------------------ | ------------------------------- |
| ROUND_CLOSED       | Betting attempted after closing |
| INVALID_SELECTION  | Selected numbers invalid        |
| LIMIT_EXCEEDED     | Stake exceeds limits            |
| INSUFFICIENT_FUNDS | Wallet rejected debit           |
| DUPLICATE_REQUEST  | Same bet submitted twice        |
| MAX_WIN_REACHED    | Exceeds allowed payout cap      |
| WALLET_TIMEOUT     | Wallet did not respond          |

---

# Compliance & Logging

Every request and response must be logged with:

* timestamp
* operator ID
* round ID
* bet ID
* IP address
* signature digest

Logs must be exportable for:

* regulators
* operators
* internal audit

---

## Next Steps

* Add RTP & payout table documentation
* Add commit–reveal RNG blockchain documentation
* Add operator configuration endpoints
* Provide Postman collection format
