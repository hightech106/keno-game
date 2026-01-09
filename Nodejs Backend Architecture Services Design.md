# Node.js Backend Architecture & Services Design

## Overview

This document describes the scalable backend architecture for a
blockchain‑based gaming platform built using Node.js with TypeScript,
supporting automatic scheduled 10‑second rounds, instant numeric
results, multi‑operator integration, and provably fair randomness via
commit--reveal on blockchain.

## Core Technology Stack

-   Node.js (TypeScript)
-   Fastify or Express for HTTP APIs
-   PostgreSQL for transactional storage
-   Redis for caching and pub/sub
-   Optional: ClickHouse for analytics
-   Kafka or Redis Streams for event messaging
-   Ethereum‑compatible blockchain for commit--reveal fairness

## High‑Level Architecture

The platform consists of loosely coupled microservices to support
horizontal scaling, fault isolation, and independent deployment.

### Services

1.  **Game Engine Service**
    -   Manages 10‑second scheduled rounds
    -   Accepts and validates bets
    -   Settles wins and losses
    -   Enforces configurable bet and win limits
2.  **RNG & Fairness Service**
    -   Generates cryptographically secure random seeds
    -   Commits seed hash to blockchain before each round
    -   Reveals seed after round settlement
    -   Enables public verification of results
3.  **Operator Gateway API**
    -   REST API for external betting operators
    -   Wallet debit/credit webhook integrations
    -   HMAC/JWT authentication
    -   Request rate limiting
4.  **Admin Backoffice Service**
    -   Operator configuration
    -   Payout table management
    -   Language and region settings
    -   Risk and limit configuration
5.  **Reporting and Analytics Service**
    -   RTP monitoring (target 88--89%)
    -   Operator‑level performance metrics
    -   Regulator export reports
    -   Large‑scale round data aggregation
6.  **Realtime Notification Service**
    -   WebSocket/SSE broadcasting
    -   Round start/stop/result events
    -   Supports WebView and mobile browsers

## Scheduled Round Lifecycle (10 Seconds)

1.  Open round window
2.  Accept bets
3.  Close betting
4.  Generate and reveal result numbers
5.  Settle bets and update operator balances
6.  Publish round result to clients

## Database Layer

-   PostgreSQL for ACID‑compliant transactions
-   Redis for caching & session management
-   Write‑ahead audit logs for regulatory traceability

### Key Tables

-   players
-   bets
-   rounds
-   settlements
-   operators
-   seeds and commit hashes

## Communication Patterns

-   REST for operator integration
-   gRPC or message queues for internal communication
-   Event‑driven round processing

## Security Controls

-   TLS‑only transport
-   HMAC signed webhook traffic
-   RBAC for admin access
-   Input validation and sanitization
-   Anti‑fraud monitoring and velocity limits

## RTP and Profitability Controls

-   Medium volatility game design
-   RTP target: **88--89%**
-   House edge ≥ 11%
-   Automatic RTP drift alerts
-   Maximum win configurable per operator

## Scalability Characteristics

-   Stateless service design
-   Horizontal autoscaling
-   Idempotent transaction processing
-   Graceful degradation under load

## Compliance and Auditability

-   Full bet/round ledger export
-   Seed commit‑reveal verification
-   Operator separation model
-   Regulator‑ready reporting

------------------------------------------------------------------------

**Status:** Architecture approved and aligned with project requirements.
**Next Step:** API endpoint specification and JSON schema design.
