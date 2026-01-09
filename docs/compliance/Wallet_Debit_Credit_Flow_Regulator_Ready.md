# Wallet Debit / Credit Flow (Regulator‑Ready)

This document defines the wallet transaction model for the Enterprise
Virtual Keno platform.\
Funds are always held by the **operator**, not the game provider.

------------------------------------------------------------------------

## Principles

-   game service **never** stores player funds
-   debit occurs **before** bet acceptance
-   credit occurs **only after** round settlement
-   all actions are auditable
-   every transaction has unique ID
-   rollback must always be possible

------------------------------------------------------------------------

## Transaction Types

-   DEBIT --- bet placement
-   CREDIT --- payout for winning bets
-   ROLLBACK --- recovery after failure

------------------------------------------------------------------------

## Standard Debit Flow

1.  Player places bet
2.  Game engine validates bet
3.  Game service sends **DEBIT request** to operator wallet
4.  Operator wallet responds APPROVED or REJECTED
5.  If APPROVED → bet is recorded
6.  If REJECTED → bet fails gracefully

### Debit Request Example

    {
      "transactionId": "TX-882291",
      "type": "DEBIT",
      "amount": 2.00,
      "playerId": "A67382",
      "roundId": "20260109-123456"
    }

------------------------------------------------------------------------

## Standard Credit Flow

Performed when round outcome is finalized.

1.  Round is settled
2.  Winning bets identified
3.  Game service sends **CREDIT request** to operator wallet
4.  Operator confirms
5.  Player balance updated

### Credit Request Example

    {
      "transactionId": "TX-882295",
      "type": "CREDIT",
      "amount": 160.00,
      "betId": "BET-889234"
    }

------------------------------------------------------------------------

## Rollback Flow

Rollback is mandatory for regulator compliance.

Rollback triggers include:

-   wallet timeout
-   partial acceptance failure
-   duplicate processing
-   network interruption
-   operator downtime
-   engine crash after debit

### Rollback Request Example

    {
      "transactionId": "TX-882291",
      "reason": "WALLET_TIMEOUT"
    }

------------------------------------------------------------------------

## Idempotency & Safety

-   every request contains **unique transactionId**
-   retries do not duplicate money movement
-   ledger journal entries immutable
-   every step logged with timestamp

------------------------------------------------------------------------

## Fraud‑Prevention Hooks

-   transaction velocity analysis
-   abnormal exposure monitor
-   geo/IP correlation
-   player risk scoring
-   operator alert flags

------------------------------------------------------------------------

## Compliance Statement

This model supports:

-   African gaming regulators
-   international markets
-   external auditing bodies
-   responsible gaming controls

------------------------------------------------------------------------

End of document.
