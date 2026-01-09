# Keno Virtual Game – Database and Data Model Design

This document describes the database schema and data model design for the Enterprise-Grade Virtual Keno Game intended for B2B casino operators. It is aligned with the full project requirements, including scalability, security, auditing, blockchain provable fairness, multi-language support, and regulatory readiness.

---

## 🎯 Design Goals

* Support millions of rounds per day
* Multi-operator architecture (200+ operators)
* Regulator‑ready logging and audit trails
* Configurable payout tables and limits
* Provably fair RNG via blockchain commit–reveal
* Fast settlement and wallet compatibility
* International and African language localization
* Support for reporting and analytics

---

## 🧩 Core Entities Overview

The system requires the following primary data entities:

1. Operators
2. Game Rounds
3. Bets
4. Results / Settlement Transactions
5. Payout Configuration
6. RNG Seeds (Commit–Reveal)
7. Audit Logs
8. Localization Resources
9. System Configuration

---

## 🗄 Database Technology Choices

* **Primary DB:** PostgreSQL (Transactional, ACID)
* **Cache:** Redis (Sessions, rate limits, active rounds)
* **Analytics (optional):** ClickHouse or BigQuery (massive log data)

Partitioning, indexing, and archiving strategies are applied to ensure scalability and performance.

---

# 📌 Operators Table

Stores configuration per B2B operator.

### Purpose

* White‑label customization
* Currency and limit settings
* Regional restrictions

### Fields

| Field               | Type      | Description                       |
| ------------------- | --------- | --------------------------------- |
| operator_id         | UUID (PK) | Unique operator identifier        |
| name                | Text      | Operator display name             |
| logo_url            | Text      | Branding asset reference          |
| primary_color       | Text      | UI theme color                    |
| currency_code       | Text      | ISO currency code                 |
| default_language    | Text      | Default locale code               |
| min_bet             | Numeric   | Minimum bet allowed               |
| max_bet             | Numeric   | Maximum bet allowed               |
| max_win_per_ticket  | Numeric   | Maximum payout allowed per ticket |
| region_restrictions | JSON      | List of restricted regions        |
| status              | Enum      | active / suspended                |
| created_at          | Timestamp | Creation time                     |

---

# 🎲 Game Rounds Table

Tracks automatically scheduled 10‑second rounds.

### Purpose

* Round lifecycle state
* Drawn numbers
* Blockchain commit–reveal references

### Fields

| Field                       | Type        | Description                        |
| --------------------------- | ----------- | ---------------------------------- |
| round_id                    | Bigint (PK) | Sequential round identifier        |
| round_start_time            | Timestamp   | Round open time                    |
| round_end_time              | Timestamp   | Round close time                   |
| numbers_drawn               | Integer[20] | Final 20 Keno numbers              |
| server_seed_hash            | Text        | Seed hash committed to blockchain  |
| server_seed                 | Text        | Revealed seed value                |
| blockchain_commit_reference | Text        | Tx hash reference for commit       |
| blockchain_reveal_reference | Text        | Tx hash reference for reveal       |
| status                      | Enum        | open / closed / settled / revealed |
| created_at                  | Timestamp   | Creation time                      |

---

# 🎫 Bets Table

Stores every player bet in anonymized form.

### Purpose

* Settlement processing
* Reporting & auditing
* Fraud detection

### Fields

| Field             | Type        | Description                        |
| ----------------- | ----------- | ---------------------------------- |
| bet_id            | UUID (PK)   | Unique bet identifier              |
| round_id          | Bigint (FK) | Linked round                       |
| operator_id       | UUID (FK)   | Operator placing the bet           |
| player_token      | Text        | Non-PII player reference token     |
| numbers_selected  | Integer[]   | Player-selected numbers (1–10)     |
| pick_count        | Integer     | Quantity of selected numbers       |
| bet_amount        | Numeric     | Wagered stake                      |
| potential_max_win | Numeric     | Upper payout bound                 |
| settlement_status | Enum        | pending / won / lost / rolled_back |
| win_amount        | Numeric     | Calculated payout                  |
| created_at        | Timestamp   | Time bet was placed                |

Indexes:

* round_id
* operator_id
* created_at (partitioning by date recommended)

---

# 🧮 Settlement / Wallet Transactions Table

Tracks debits and credits for wallet integration.

### Purpose

* Idempotent processing
* Rollback support
* Operator reconciliation

### Fields

| Field          | Type      | Description                 |
| -------------- | --------- | --------------------------- |
| transaction_id | UUID (PK) | Unique transaction id       |
| bet_id         | UUID (FK) | Linked bet id               |
| operator_id    | UUID (FK) | Operator reference          |
| debit_amount   | Numeric   | Bet amount debited          |
| credit_amount  | Numeric   | Win credited                |
| wallet_status  | Enum      | success / failed / pending  |
| rollback_flag  | Boolean   | Indicates rollback occurred |
| created_at     | Timestamp | Transaction timestamp       |

---

# 🧠 Payout Configuration Table

Configurable payout tables per operator.

Supports administrative control of RTP and house edge (≥ 11%).

### Fields

| Field       | Type      | Description                 |
| ----------- | --------- | --------------------------- |
| config_id   | UUID (PK) | Unique config id            |
| operator_id | UUID (FK) | Operator using this config  |
| pick_count  | Integer   | Numbers chosen by player    |
| hit_count   | Integer   | Matches required for payout |
| multiplier  | Numeric   | Payout multiplier           |
| active_flag | Boolean   | Is configuration active     |
| created_at  | Timestamp | Creation time               |

---

# 🔐 RNG Seed Log Table

Supports blockchain provably fair commit–reveal mechanism.

### Fields

| Field               | Type        | Description                |
| ------------------- | ----------- | -------------------------- |
| seed_id             | UUID (PK)   | Unique seed record         |
| round_id            | Bigint (FK) | Linked round               |
| server_seed         | Text        | Secret random seed         |
| server_seed_hash    | Text        | Hash published before draw |
| commit_tx_reference | Text        | Blockchain commit tx       |
| reveal_tx_reference | Text        | Blockchain reveal tx       |
| reveal_timestamp    | Timestamp   | When seed was revealed     |

---

# 🧾 Audit Log Table

Required for regulatory compliance and investigations.

### Fields

| Field       | Type        | Description                         |
| ----------- | ----------- | ----------------------------------- |
| log_id      | UUID (PK)   | Unique log id                       |
| event_type  | Text        | Event category                      |
| round_id    | Bigint (FK) | Associated round                    |
| operator_id | UUID (FK)   | Operator involved                   |
| bet_id      | UUID (FK)   | Related bet if applicable           |
| description | Text        | Detailed human-readable description |
| created_at  | Timestamp   | Logged time                         |

---

# 🌍 Localization Table

Supports all required languages including RTL Arabic.

### Fields

| Field       | Type           | Description            |
| ----------- | -------------- | ---------------------- |
| locale_code | Text (PK part) | Language/country code  |
| key         | Text (PK part) | Translation key        |
| value       | Text           | Localized message text |

Supported languages include:

* English
* French
* Spanish
* Portuguese
* Arabic (RTL)
* Swahili
* Amharic
* Tigrinya
* Oromo

---

# ⚙ System Configuration Table

Stores global tunable game settings.

### Fields

| Field       | Type      | Description                |
| ----------- | --------- | -------------------------- |
| key         | Text (PK) | Config key                 |
| value       | JSON      | Config value               |
| description | Text      | Human-readable explanation |

Example config values:

* round_interval_seconds = 10
* max_payout_multiplier
* responsible_gaming_flags

---

## 🚀 Performance & Scaling Strategy

* Partition bets table by date
* Index round_id, operator_id, created_at
* Use Redis caching for active rounds
* Archive historical data to analytics storage
* Queue‑based async processing for settlements

---

## 🔐 Security Considerations

* Encrypted connections only
* No client‑side trust for game calculations
* Anti‑bot rate limiting tables
* Session validation tokens stored securely

---

## 🧪 Testing & Verification Support

Database supports:

* RTP simulation dataset storage
* Edge‑case payout testing
* Multi‑language verification cases
* Load testing logs

---

## 📦 Compliance & Regulator Readiness

* Complete round history retention
* Immutable blockchain references
* Detailed audit log capability
* Exportable reports (CSV/JSON/PDF)

---

## ✅ Summary

This schema is designed to:

* Scale to millions of rounds per day
* Serve 200+ independent operators
* Provide transparent, auditable results
* Maintain security and performance
* Meet African and international licensing expectations
