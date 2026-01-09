# Keno Virtual Game – Enterprise Database Schema

This document defines the core database schema for the **Enterprise-Grade Virtual Keno Game** supporting multi-operator B2B deployment, scheduled rounds, instant results, blockchain-backed RNG, and regulatory auditability.

---

## 📦 Core Tables Overview

- operators
- players
- rounds
- bets
- bet_results
- payout_tables
- wallet_transactions
- rng_commit_reveal
- audit_logs
- fraud_flags

---

## 1. operators

Stores configuration and white-label identity for each B2B operator.

| Field | Type | Description |
|------|------|-------------|
| operator_id | UUID (PK) | Unique operator ID |
| name | TEXT | Operator name |
| status | ENUM(active, disabled) | Availability |
| default_currency | TEXT | Currency code |
| default_language | TEXT | Language code |
| min_bet | DECIMAL | Minimum stake allowed |
| max_bet | DECIMAL | Maximum stake allowed |
| max_win_per_bet | DECIMAL | Maximum allowable payout |
| house_edge_setting | DECIMAL | RTP tuning value |
| ip_whitelist | JSON | Allowed API IPs |
| branding_config | JSON | Logo, theme settings |
| created_at | TIMESTAMP | Creation date |

Indexes:
- status
- name

---

## 2. players

Represents players mapped to operator systems.

| Field | Type | Description |
|------|------|-------------|
| player_id | UUID (PK) | Internal player reference |
| operator_id | UUID (FK) | Owning operator |
| external_player_ref | TEXT | Operator system player ID |
| status | ENUM(active, blocked) | Player state |
| KYC_level | INTEGER | Verification level |
| country | TEXT | Player country |
| created_at | TIMESTAMP | Creation date |

Notes:
- Balance is **not stored**
- Funds reside in operator wallet systems

---

## 3. rounds

Defines every Keno draw cycle.

| Field | Type | Description |
|------|------|-------------|
| round_id | TEXT (PK) | Unique round identifier |
| status | ENUM(open, closed, drawn, settled, archived) | Round lifecycle |
| open_time | TIMESTAMP | Round open timestamp |
| close_time | TIMESTAMP | Betting closed timestamp |
| draw_time | TIMESTAMP | Numbers generated time |
| numbers_drawn | INT[] | 20 drawn numbers |
| total_bets_sum | DECIMAL | Total stakes |
| total_payout_sum | DECIMAL | Total payouts |
| rtp_this_round | DECIMAL | RTP value of round |
| created_at | TIMESTAMP | Creation time |

Indexes:
- status
- open_time
- close_time

---

## 4. bets

Stores player tickets placed for a round.

| Field | Type | Description |
|------|------|-------------|
| bet_id | UUID (PK) | Unique bet ID |
| round_id | TEXT (FK) | Related round |
| player_id | UUID (FK) | Player reference |
| operator_id | UUID (FK) | Operator reference |
| selection_numbers | INT[] | 1–10 selected numbers |
| stake_amount | DECIMAL | Bet value |
| potential_win_amount | DECIMAL | Max possible win |
| status | ENUM(placed, settled, canceled, rolled_back) | Bet state |
| created_at | TIMESTAMP | Creation time |

Indexes:
- round_id
- player_id
- operator_id

---

## 5. bet_results

Separated results table for audit clarity.

| Field | Type | Description |
|------|------|-------------|
| bet_result_id | UUID (PK) | Result record ID |
| bet_id | UUID (FK) | Related bet |
| round_id | TEXT (FK) | Round reference |
| hits_count | INTEGER | Numbers matched |
| win_amount | DECIMAL | Actual win |
| outcome | ENUM(win, loss, push) | Result type |
| settled_at | TIMESTAMP | Settlement timestamp |

---

## 6. payout_tables

Stores payout multipliers for Pick 1–10 game modes.

| Field | Type | Description |
|------|------|-------------|
| table_id | UUID (PK) | Table record |
| operator_id | UUID (nullable FK) | Custom per operator |
| pick_size | INTEGER | 1–10 |
| hits | INTEGER | Number of matches |
| payout_multiplier | DECIMAL | Multiplier |
| rtp_contribution | DECIMAL | Expected RTP share |

Supports:
- static regulator tables
- controlled RTP bands

---

## 7. wallet_transactions

Tracks debit/credit/rollback operations.

| Field | Type | Description |
|------|------|-------------|
| transaction_id | UUID (PK) | Transaction reference |
| operator_id | UUID (FK) | Related operator |
| player_id | UUID (FK) | Related player |
| bet_id | UUID (nullable FK) | Related bet if any |
| round_id | TEXT | Related round |
| type | ENUM(debit, credit, rollback) | Transaction type |
| amount | DECIMAL | Transaction amount |
| status | ENUM(pending, success, failed) | Processing state |
| external_ref | TEXT | Operator wallet ID |
| created_at | TIMESTAMP | Creation time |

---

## 8. rng_commit_reveal

Stores provably fair randomness values.

| Field | Type | Description |
|------|------|-------------|
| round_id | TEXT (PK) | Round reference |
| seed_secret | TEXT | Revealed seed |
| seed_hash | TEXT | Committed hash |
| reveal_time | TIMESTAMP | Time of reveal |
| hash_algorithm | TEXT | Hash method used |
| rng_algorithm_version | TEXT | RNG engine version |

Used for:
- third-party lab auditing
- blockchain anchoring
- player verification

---

## 9. audit_logs

Regulator-grade auditing table.

| Field | Type | Description |
|------|------|-------------|
| log_id | UUID (PK) | Unique log entry |
| event_type | TEXT | Event identifier |
| actor_type | ENUM(system, operator, admin) | Who triggered it |
| actor_id | TEXT | Actor reference |
| request_payload | JSON | Input snapshot |
| response_payload | JSON | Output snapshot |
| created_at | TIMESTAMP | Timestamp |

Covers:
- bets
- payouts
- settings changes
- suspicious activity

---

## 10. fraud_flags

Anti-fraud and AML signaling table.

| Field | Type | Description |
|------|------|-------------|
| flag_id | UUID (PK) | Flag record |
| player_id | UUID (FK) | Player |
| operator_id | UUID (FK) | Operator |
| reason | TEXT | Detection cause |
| severity | ENUM(low, medium, high) | Risk level |
| resolved_status | ENUM(open, closed) | Resolution |
| created_at | TIMESTAMP | Timestamp |

---

## 🔐 Compliance Notes

- No player balances are stored
- All financial movement is via operator wallets
- Full audit trail retained indefinitely
- RNG commit–reveal guarantees fairness
- Schema supports GLI/iTech certification paths

---
