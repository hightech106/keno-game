# Round Engine Architecture & Lifecycle

This document describes the enterprise-grade round management system for
the Virtual Keno Game platform. It reflects all requirements discussed,
including scheduled rounds, instant results, blockchain-backed RNG,
Node.js backend, and B2B scalability.

## Round Lifecycle

Each round proceeds through six distinct phases:

1.  OPEN -- players may place bets.
2.  CLOSING -- final second of betting, wagers disabled.
3.  DRAWING -- RNG generates 20 numbers for the round.
4.  SETTLING -- winnings calculated based on matches and payout tables.
5.  PAYOUT -- wallet crediting performed for winners.
6.  ARCHIVED -- round information stored immutably for audit and
    reporting.

Default recommended round duration: 10 seconds - 0--8s: betting open -
8--10s: draw, settle, and display results

## Architecture Components

### Round Scheduler Service

-   Creates round IDs
-   Opens and closes betting windows
-   Handles high availability and recovery

### RNG Commit--Reveal Service

-   Generates secret seed per round
-   Publishes hash prior to draw (commit)
-   Reveals seed after draw to verify fairness
-   Produces 20 unique numbers from seed

### Bet Engine Service

-   Validates wagers
-   Applies bet limits
-   Communicates with wallet for debit
-   Stores tickets immutably

### Settlement Engine

-   Compares drawn numbers to tickets
-   Calculates winnings according to payout tables
-   Supports bulk asynchronous processing

### Wallet Gateway Service

-   Performs debit for bets
-   Performs credit for wins
-   Manages rollback in case of error
-   Ensures idempotent transactions

### Result Broadcast Service

-   Pushes numbers instantly via WebSocket
-   Supports REST and webhooks for operators
-   Designed for low bandwidth environments

### Audit and Logs Service

Tracks: - round identifiers - results - seeds and hashes - total bet
handle - total payouts - RTP over time - operator summaries

## Crash Recovery

If failure occurs during a round: - unfinished round is invalidated -
bets are rolled back automatically - system resumes in next round safely

Rules ensure: - no duplicate rounds - no double settlement - no manual
intervention required

## Technology Stack Recommendations

-   Node.js with TypeScript
-   Redis for caching and scheduling
-   PostgreSQL for transactional persistence
-   RabbitMQ or Kafka for messaging
-   WebSockets for real-time delivery
-   Docker and Kubernetes for scaling

## Compliance and Fairness

-   Blockchain commit--reveal guarantees verifiable randomness
-   All rounds logged immutably
-   Auditor review supported
-   Meets B2B operator and regulator expectations
