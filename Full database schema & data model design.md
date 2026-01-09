# 🗄️ Full Database Schema & Data Model Design

## Overview

This document defines the **logical-level database schema** (not SQL implementation). The design focuses on scalability, performance, and compliance requirements.

---

## 🗄️ Core Database Strategy

### Database Technologies

| Database | Purpose |
|----------|---------|
| **PostgreSQL** | Primary transactional database |
| **Redis** | Caching and real-time round state |
| **ClickHouse/BigQuery** | High-volume analytics and log history |

### Partitioning Strategy

Data is partitioned by:
- **Date** (for time-series data)
- **operatorId** (for multi-tenant isolation)

### Benefits

- ✅ Supports **millions of records per day**
- ✅ **Fast queries** with proper indexing
- ✅ **Cheap archival storage** for historical data

---

## 📚 Main Entity Groups

The schema includes tables for:

1. ✅ Operators & branding
2. ✅ Players (tokenized)
3. ✅ Rounds
4. ✅ Bets
5. ✅ Payout settlements
6. ✅ RNG seeds & proofs
7. ✅ Wallet transactions
8. ✅ Configuration settings
9. ✅ Localization text
10. ✅ Audit & compliance logs

---

## 🏢 1. Operators Table

**Purpose**: Stores each partner betting company configuration and branding.

**Table**: `operators`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `operatorId` | string | **PK** | Unique operator identifier |
| `name` | string | | Company name |
| `brandName` | string | | Brand display name |
| `primaryColor` | string | | Primary brand color (hex) |
| `logoUrl` | string | | Logo image URL |
| `defaultLanguage` | string | | Default language code |
| `defaultCurrency` | string | | Default currency code |
| `regionRestrictions` | array | | Allowed/restricted regions |
| `status` | enum | | `active` / `suspended` |
| `createdAt` | timestamp | | Creation timestamp |

---

## 🧑‍💻 2. Players Table (Tokenized)

**Purpose**: Stores player references without identifying information.

> **Privacy Note**: We **do NOT store identifying information** to avoid privacy risks.

**Table**: `players`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `playerId` | string | **PK** | Platform-internal player ID |
| `operatorId` | string | **FK** → `operators` | Associated operator |
| `externalPlayerRef` | string | | Tokenized ID from operator |
| `createdAt` | timestamp | | Account creation time |
| `status` | enum | | `active` / `blocked` |

---

## 🎯 3. Rounds Table

**Purpose**: Stores every scheduled round entry and its lifecycle state.

**Table**: `rounds`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `roundId` | string | **PK** | Unique round identifier |
| `status` | enum | | `OPEN` / `LOCKED` / `DRAWING` / `COMPLETED` / `CANCELLED` |
| `scheduledTime` | timestamp | | Scheduled start time |
| `openTime` | timestamp | | Round opened for bets |
| `closeTime` | timestamp | | Round closed (locked) |
| `drawTime` | timestamp | | Numbers drawn |
| `numbersDrawn` | array[20] | | Array of 20 drawn numbers |
| `totalBet` | decimal | | Total bet volume for round |
| `totalPayout` | decimal | | Total payout for round |
| `resultPublished` | boolean | | Whether results are published |

### Indexes

- `roundId` (primary key)
- `status`
- `scheduledTime`

---

## 🧾 4. Bets Table (High Volume)

**Purpose**: Stores all player bets. **Critical high-volume table**.

**Table**: `bets`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `betId` | string | **PK** | Unique bet identifier |
| `operatorId` | string | **FK** | Associated operator |
| `playerId` | string | **FK** → `players` | Player who placed bet |
| `roundId` | string | **FK** → `rounds` | Associated round |
| `betAmount` | decimal | | Stake amount |
| `selectionCount` | integer | 1-10 | Number of numbers selected |
| `numbersSelected` | array | | Selected numbers |
| `hitsCount` | integer | | Number of matching draws |
| `payoutMultiplier` | decimal | | Win multiplier applied |
| `winAmount` | decimal | | Total win amount |
| `credited` | boolean | | Whether winnings credited |
| `maxWinCapApplied` | boolean | | Max win limit applied flag |
| `createdAt` | timestamp | | Bet placement time |

### Indexes

- `roundId`
- `operatorId`
- `playerId`
- `createdAt` (for partitioning)

### Partitioning

> **Recommended**: Partition by **date** due to high volume.

---

## 🤑 5. Payout Settlement Table

**Purpose**: Tracks credit operations for dispute resolution.

**Table**: `payouts`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `payoutId` | string | **PK** | Unique payout identifier |
| `betId` | string | **FK** → `bets` | Associated bet |
| `playerId` | string | **FK** → `players` | Player receiving payout |
| `operatorId` | string | **FK** → `operators` | Associated operator |
| `winAmount` | decimal | | Amount paid out |
| `walletReferenceId` | string | | External wallet transaction ID |
| `status` | enum | | `SUCCESS` / `FAILED` / `PENDING` |
| `createdAt` | timestamp | | Payout creation time |

---

## 🎲 6. RNG Seed & Fairness Proof Table

**Purpose**: Stores commit–reveal model data for provably fair verification.

**Table**: `rng_round_seeds`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `roundId` | string | **PK, FK** → `rounds` | Associated round |
| `commitHash` | string | | SHA-256 hash (published before draw) |
| `serverSeed` | string | | Server-generated seed |
| `revealSeed` | string | | Revealed seed (after draw) |
| `rngMethodVersion` | string | | RNG algorithm version |
| `verified` | boolean | | Verification status |
| `createdAt` | timestamp | | Seed creation time |

---

## 🔌 7. Wallet Transaction Logs

**Purpose**: Tracks all wallet operations (debit, credit, rollback).

**Transaction Types Tracked**:
- 💸 Debit on bet placement
- 💰 Credit on win
- ↩️ Rollback events

**Table**: `wallet_transactions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `transactionId` | string | **PK** | Unique transaction identifier |
| `operatorId` | string | **FK** → `operators` | Associated operator |
| `playerId` | string | **FK** → `players` | Player account |
| `betId` | string | **FK** → `bets` (nullable) | Associated bet (if applicable) |
| `roundId` | string | **FK** → `rounds` (nullable) | Associated round (if applicable) |
| `type` | enum | | `DEBIT` / `CREDIT` / `ROLLBACK` |
| `amount` | decimal | | Transaction amount |
| `requestPayload` | jsonb | | Original request payload |
| `responsePayload` | jsonb | | Wallet service response |
| `status` | enum | | Transaction status |
| `createdAt` | timestamp | | Transaction timestamp |

---

## ⚙️ 8. Configuration & Limits

**Purpose**: Per-operator game configuration and limits.

**Table**: `operator_config`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `operatorId` | string | **PK, FK** → `operators` | Associated operator |
| `minBet` | decimal | | Minimum bet amount |
| `maxBet` | decimal | | Maximum bet amount |
| `maxWinPerTicket` | decimal | | Maximum win per ticket |
| `volatilityMode` | enum | | `low` / `medium` / `high` |
| `defaultLanguage` | string | | Default language code |
| `houseEdgeTarget` | decimal | | Target house edge percentage |
| `enabled` | boolean | | Whether game is enabled |
| `createdAt` | timestamp | | Configuration creation time |
| `updatedAt` | timestamp | | Last update time |

---

## 🌍 9. Localization Table

**Purpose**: Multi-language support for UI, errors, and tutorials.

> **Critical**: Multi-language support is essential for global operations.

**Table**: `translations`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `key` | string | **PK** | Translation key |
| `languageCode` | string | **PK** | ISO language code |
| `value` | text | | Translated text |
| `context` | enum | | `UI` / `error` / `tutorial` |

### Mandatory Languages

| Language | Code | Notes |
|----------|------|-------|
| English | `en` | Default |
| French | `fr` | |
| Spanish | `es` | |
| Portuguese | `pt` | |
| Arabic | `ar` | RTL (Right-to-Left) |
| Swahili | `sw` | |
| Amharic | `am` | |
| Tigrinya | `ti` | |
| Oromo | `om` | |

> **Note**: JSON i18n files will be generated from this table.

---

## 🛡️ 10. Compliance Audit Log

**Purpose**: Required for regulatory compliance and traceability.

**Table**: `audit_logs`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `logId` | string | **PK** | Unique log identifier |
| `actorType` | enum | | `SYSTEM` / `ADMIN` / `OPERATOR` |
| `actorId` | string | | ID of actor performing action |
| `action` | string | | Action performed |
| `entityType` | enum | | `ROUND` / `BET` / `CONFIG` / `USER` / `WALLET` |
| `entityId` | string | | ID of affected entity |
| `beforeValue` | jsonb | | State before change |
| `afterValue` | jsonb | | State after change |
| `ipAddress` | string | | IP address of request |
| `timestamp` | timestamp | | Action timestamp |

### Purpose

This table proves:
- ✅ **No manipulation** - All changes are logged
- ✅ **Traceability** - Complete audit trail
- ✅ **Secure config changes** - Config modifications tracked

---

## 🚨 Anti-Fraud & Risk Tables

**Purpose**: Track suspicious activities and risk flags.

**Table**: `risk_flags`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `flagId` | string | **PK** | Unique flag identifier |
| `playerId` | string | **FK** → `players` | Flagged player |
| `operatorId` | string | **FK** → `operators` | Associated operator |
| `reasonCode` | string | | Reason for flag |
| `notes` | text | | Additional details |
| `createdAt` | timestamp | | Flag creation time |
| `resolved` | boolean | | Whether flag is resolved |

### Possible Risk Reasons

- 🤖 **Bot-like speed** - Unusually fast betting patterns
- 🎯 **Impossible win streaks** - Suspicious winning patterns
- 📊 **Large correlated bets cluster** - Coordinated betting activity
- 💰 **Repeated max cap hits** - Frequently hitting win limits

---

## ♻️ Data Retention Strategy

Due to high data volume, a tiered retention strategy is implemented:

| Tier | Storage | Retention Period | Data Type |
|------|---------|------------------|-----------|
| **Hot** | PostgreSQL | **90 days** | Recent transactional data |
| **Warm** | ClickHouse/BigQuery | **1 year** | Analytics and historical queries |
| **Cold** | Object Storage | **Indefinite** | Archived data (exported) |

### Regulatory Exception

> **Important**: **Compliance logs** (audit_logs) are retained **longer** than standard retention periods as required by regulators.

---

## Summary

This schema design provides:

- ✅ **Scalable architecture** supporting millions of records/day
- ✅ **Privacy-first approach** with tokenized player data
- ✅ **Provably fair system** with RNG seed tracking
- ✅ **Complete audit trail** for regulatory compliance
- ✅ **Multi-language support** for global operations
- ✅ **Risk management** with fraud detection capabilities
- ✅ **Efficient partitioning** for performance optimization

All tables are designed with appropriate indexes, foreign keys, and partitioning strategies to ensure optimal performance at scale.