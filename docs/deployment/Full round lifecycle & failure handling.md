# 🏁 Round Lifecycle & Failure Handling

## Overview

A single round passes through **strict states** to guarantee fairness, speed, and auditability. Each state transition is carefully controlled to ensure game integrity and regulatory compliance.

---

## Round State Machine

A round progresses through the following states:

```
SCHEDULED → OPEN → LOCKED → DRAWING → COMPLETED → SETTLED → ARCHIVED
                                                              ↓
                                                          CANCELLED (edge case)
```

### Round States

| State | Description | Duration |
|-------|-------------|----------|
| `SCHEDULED` | Round created, not yet accepting bets | Pre-round |
| `OPEN` | Accepting player bets | ~4 seconds (default) |
| `LOCKED` | Betting closed, preparing for draw | ~1 second |
| `DRAWING` | Random number generation in progress | ≤ 200ms |
| `COMPLETED` | Results available, payouts calculated | < 1s |
| `SETTLED` | Winnings credited to player wallets | Async |
| `ARCHIVED` | Round data archived for compliance | Post-settlement |
| `CANCELLED` | Round cancelled and refunded | Edge case |

---

## 1️⃣ SCHEDULED

**Purpose**: Round is created and prepared before accepting bets.

### Creation

- Created by the **round scheduler** service
- Scheduled for future execution

### Initial Data

- `roundId` generated
- `timestamp` set
- **Commit hash** already published (provably fair)
- **Future reveal seed** stored securely

### Player Access

> **Players cannot bet yet** - Round is not yet open.

---

## 2️⃣ OPEN (Players May Bet)

**Purpose**: Round is accepting player bets.

### What Happens

1. Round opens for betting
2. **WebSocket event**: `ROUND_OPEN` sent to all clients
3. API endpoint `/api/v1/game/keno/current-round` returns:
   - `roundId`
   - `commitHash`
   - `countdownTimer`
4. Bets are accepted
5. Wallet debit calls are executed

### Validation Rules

- ✅ **Min/max bet** enforced per operator config
- ✅ **Pick 1–10 validation** - Must select between 1 and 10 numbers
- ✅ **Operator limits** applied
- ✅ Round must be in `OPEN` state

### Typical Duration

**~4 seconds** (configurable 2–60 seconds per operator)

---

## 3️⃣ LOCKED (Betting Stops)

**Purpose**: Betting closes to prepare for the draw.

### Timing

Occurs **typically 1 second before draw** time.

### Actions

1. ✅ **Bets closed** - No new bets accepted
2. ✅ **WebSocket event**: `ROUND_LOCKED` sent to all clients
3. ✅ **Pending wallet debits** must complete
4. ✅ **Late-bet attempts** rejected with error: `BET_AFTER_LOCK`

### Fairness Guarantee

> **Critical**: Once locked, it is **mathematically impossible** to influence round outcomes.

---

## 4️⃣ DRAWING (RNG Executes)

**Purpose**: Random number generation and draw execution.

### Process

1. **Reveal seed** recovered from secure storage
2. **Commit hash** verified internally
3. **20 numbers generated** from seed using RNG algorithm
4. **Results stored immutably** in database
5. **Optional blockchain write** (hash anchor for transparency)

### Requirements

- Numbers must be **unique** (no duplicates)
- Numbers range: **1–80**
- Each round draws exactly **20 numbers**

### Performance Target

**Duration**: ≤ **200ms**

---

## 5️⃣ COMPLETED (Results Available)

**Purpose**: Results are calculated and made available to players.

### System Operations

1. **Match hit counts** - Count player number matches
2. **Apply payout table** - Calculate win multipliers
3. **Enforce max win cap** - Apply operator limits
4. **Compute operator GGR statistics** - Gross gaming revenue
5. **Send WebSocket event**: `ROUND_RESULT`

### Player Experience

Players now see:
- ✅ Numbers drawn
- ✅ Their win or loss status
- ✅ Payout multiplier and amount
- ✅ Fairness verification data

### Performance Target

**Duration**: < **1 second** for batch processing

---

## 6️⃣ SETTLED (Wallet Credit Done)

**Purpose**: Winnings are credited to player wallets.

### Settlement Steps

1. `wallet/credit` API invoked per winning bet
2. Mark `credited = true` in database
3. Persist `walletReferenceId` for tracking

### Failure Handling

**If credit fails**:
- ⚠️ Automatically **retried** with exponential backoff
- ⚠️ Flagged in **risk log** for investigation
- ❌ **NOT redrawn** - Results are final

> **Important**: Results cannot be changed once drawing is complete, even if credit fails.

---

## 7️⃣ ARCHIVED / CANCELLED

**Purpose**: Round finalized or cancelled due to system issues.

### Cancellation Cases

A round may be **CANCELLED** if:

| Scenario | Condition |
|----------|-----------|
| RNG Service Unavailable | Cannot generate fair random numbers |
| Blockchain Desync | Verification chain unavailable |
| System Crash | Crash occurs before round lock |
| Seed Mismatch | Committed seed verification fails |

### Cancellation Rules

1. ✅ **Round refunds all bets** - Full refund to players
2. ✅ **Wallet rollback** - `wallet/rollback` called for all debits
3. ✅ **Full audit log** - Complete cancellation event logged
4. ✅ **Public explanation** - Reason code provided to operators/players

### Archive

Once settled or cancelled, rounds are archived for compliance retention.

---

## 🔁 Multi-Instance Scheduler Safety

### Requirement

The system must **never generate duplicate rounds**, even with multiple scheduler instances running.

### Implementation

#### Leader Election

- **Redis lock** for scheduler leader election
- **Fencing tokens** to prevent duplicate operations
- **Heartbeat monitoring** to detect failures

#### Failover Behavior

**If active scheduler fails**:
1. ✅ Backup node **takes leadership**
2. ✅ **Never replays** finished rounds
3. ✅ **Safe resume logic** runs from last known state
4. ✅ Ensures continuous operation

### Uptime Target

**99.9% uptime requirement** - High availability guaranteed.

---

## 🔒 Failure Handling Rules

### 🔹 Wallet Service Down

| Scenario | Behavior |
|----------|----------|
| **During Bet Placement** | Bets accepted but marked `PENDING_DEBIT` |
| **Retry Mechanism** | Auto-retry queue with exponential backoff |
| **Ultimate Failure** | If debit ultimately fails → bet **cancelled** |

### 🔹 RNG Failure

| Scenario | Behavior |
|----------|----------|
| **Round Status** | Round **paused** in `LOCKED` state |
| **Payouts** | **No payouts** calculated |
| **Resolution** | Round **cancelled** and all bets **refunded** |

### 🔹 Blockchain Unavailable

| Scenario | Behavior |
|----------|----------|
| **Game Continuity** | **Game continues** normally |
| **Hash Storage** | Hashes **queued** to post later |
| **Audit Trail** | Auditor notes chain outage window |

> **Note**: Blockchain is for transparency verification only, not critical for gameplay.

### 🔹 Database Primary Failure

| Scenario | Behavior |
|----------|----------|
| **Failover** | **Replica promoted** to primary |
| **Betting Continuity** | **Redis caches** maintain betting continuity |
| **Data Integrity** | No data loss, all operations logged |

---

## ⚡ Performance Goals Per Round

### Target SLA

| Operation | Target | Notes |
|-----------|--------|-------|
| **Bet Acceptance** | < **100ms** | From request to confirmation |
| **Draw Generation** | < **200ms** | RNG execution and storage |
| **Settlement Batch** | < **1s** | Process all winning bets |
| **Total Round Cycle** | ~ **5 seconds** (default) | End-to-end round duration |

### Configuration

Round cycle duration is **configurable between 2–60 seconds** depending on operator requirements.

---

## 🔍 Compliance & Audit Hooks Per Round

Each round records comprehensive audit data for regulatory compliance.

### Recorded Data

| Data Point | Purpose |
|------------|---------|
| **Commit Hash** | Provably fair verification |
| **Reveal Seed** | Complete transparency |
| **Drawn Numbers** | Game outcome |
| **Round Timestamps** | State transition timing |
| **Total Bet Volume** | Financial tracking |
| **Total Payout Volume** | Financial tracking |
| **RNG Library Version** | Algorithm traceability |
| **Blockchain Anchor Hash ID** | Immutable verification |

### Exportability

> **All audit data is exportable for regulators** upon request.

---

## Summary

This lifecycle design ensures:

- ✅ **Fairness** - Provably fair with commit-reveal scheme
- ✅ **Speed** - Sub-second draw generation and settlement
- ✅ **Reliability** - 99.9% uptime with failover mechanisms
- ✅ **Auditability** - Complete audit trail for compliance
- ✅ **Transparency** - All data verifiable by players and regulators
- ✅ **Failure Resilience** - Graceful handling of service outages