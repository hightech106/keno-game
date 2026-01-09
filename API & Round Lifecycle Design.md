# ✅ API & Round Lifecycle Design (enterprise B2B compliant)
This directly supports requirements on:

- security & anti-fraud

- wallet integration

- reporting & logging

- scalability

- regulator readiness


## 🧩 Round Lifecycle (10-second scheduled rounds)

Every round runs as follows:

1. Round Created

- round_id generated

- betting window opens

- seed hash committed to blockchain (commit phase)

2. Bet Placement Phase

- players submit bets through operator platforms

- wallet debits bet amounts

- bet request validated:

   session

   limits

   risk caps

   rate limiting

3. Betting Closes

- typically at T – 1 second before draw

- no more bets accepted

4. Number Draw

- RNG generates 20 numbers (1–80, no repetition)

- outcomes calculated

- win multipliers applied

- per-ticket max win enforced

5. Result Settlement

- wallet credits winnings

- failures trigger rollback API

6. Round Published

- result exposed to:

   operator API

   frontend UI

    reporting logs

- seed later revealed on blockchain (reveal phase)

7. Audit Logs Stored

- timestamp

- operator ID

- bet values

- numbers selected & drawn

- win/loss outcomes

This supports:

- 99.9% uptime target

- millions of rounds/day

- third-party testing audits

## 🌐 Core APIs (to meet B2B operator requirements)

## 1) Operator-facing API (external)

Used by betting companies.

Essential endpoints:

- POST /bets/place

- POST /bets/rollback

- POST /wallet/debit

- POST /wallet/credit

- GET /rounds/current

- GET /rounds/results

- GET /reports/export

- GET /operator/config

Properties:

- REST or WebSocket (both supported)

- encrypted communication (TLS)

- stateless requests

- idempotency keys for retries

## 2) Internal game engine API (microservices)

Services:

- RNG Service

- Game Engine Service

- Blockchain Fairness Service

- Admin & Operator Console

- Reporting & Analytics Service

Async communication strongly recommended via:

- message queue (Kafka / RabbitMQ)

## 🔐 Security & Anti-Fraud (requirement-aligned)

We will include:

- JWT or OAuth operator auth

- HMAC request signing

- per-IP rate limiting

- anti-bot bet throttling

- session validation

- no client-side payout logic

- anomaly-detection hooks for fraud systems

Matches requirement:

“No client-side manipulation possible”

## 📊 Logging & Reporting (regulator-ready)

Every round log contains:

- round ID

- block hash reference (commit)

- server seed hash

- numbers drawn

- player selections

- bet size

- win amount

- operator ID

- timestamp

Export in formats:

- CSV, JSON, PDF (via backend tools)

This supports:

- audit trail for regulators
- revenue reports per operator

## 🧱 Node.js Microservice Layout (suggested)

- game-engine-service

- rng-service

- blockchain-proof-service

- operator-gateway-api

- admin-backoffice-service

- reporting-analytics-service

Databases:

- PostgreSQL (primary storage)

- Redis (cache / sessions)

- optional ClickHouse (high-volume logs)