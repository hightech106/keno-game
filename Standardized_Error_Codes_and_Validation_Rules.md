# Standardized Error Codes & Validation Rules

This document defines the regulator‑ready error code structure and
validation rules for the Enterprise Virtual Keno game platform.

------------------------------------------------------------------------

## Error Code Format

All game service errors use the following format:

    ERR_<CATEGORY>_<DETAIL>

They are: - deterministic - machine‑parsable - localizable - audit‑log
safe - do not leak internal stack traces

------------------------------------------------------------------------

## Authentication & Operator Errors

  Code                         Meaning
  ---------------------------- --------------------------
  ERR_AUTH_INVALID_TOKEN       Token missing or invalid
  ERR_AUTH_OPERATOR_BLOCKED    Operator disabled
  ERR_AUTH_IP_NOT_ALLOWED      IP not whitelisted
  ERR_AUTH_SIGNATURE_INVALID   HMAC signature mismatch
  ERR_AUTH_EXPIRED             Session expired

------------------------------------------------------------------------

## Round State Errors

  Code                       Meaning
  -------------------------- -----------------------------
  ERR_ROUND_NOT_FOUND        Round ID invalid
  ERR_ROUND_CLOSED           Round already closed
  ERR_ROUND_SETTLED          Cannot bet on settled round
  ERR_ROUND_NOT_STARTED      Betting not open yet
  ERR_ROUND_RESULT_PENDING   Result not available yet

------------------------------------------------------------------------

## Bet Validation Errors

  Code                          Meaning
  ----------------------------- ----------------------------------------
  ERR_BET_AMOUNT_TOO_LOW        Below minimum stake
  ERR_BET_AMOUNT_TOO_HIGH       Above maximum stake
  ERR_BET_LIMIT_EXCEEDED        Operator max daily limit reached
  ERR_BET_DUPLICATE             Same bet already submitted
  ERR_BET_SELECTION_INVALID     Invalid numbers provided
  ERR_BET_SELECTION_COUNT       Must select 1--10 numbers
  ERR_BET_SELECTION_RANGE       Numbers must be between 1 and 80
  ERR_BET_SELECTION_DUPLICATE   Selected numbers repeated
  ERR_BET_MAX_WIN_EXCEEDED      Potential win exceeds configured limit

------------------------------------------------------------------------

## Wallet Errors

  Code                            Meaning
  ------------------------------- -------------------------------------
  ERR_WALLET_INSUFFICIENT_FUNDS   Player does not have enough balance
  ERR_WALLET_TIMEOUT              No response from wallet provider
  ERR_WALLET_REJECTED             Operator wallet rejected debit
  ERR_WALLET_ROLLBACK_FAILED      Rollback could not be confirmed

------------------------------------------------------------------------

## System Errors

  Code                         Meaning
  ---------------------------- -----------------------------
  ERR_SYSTEM_INTERNAL          Unexpected server error
  ERR_SYSTEM_MAINTENANCE       System temporarily disabled
  ERR_SYSTEM_RATE_LIMIT        Too many requests
  ERR_SYSTEM_FRAUD_SUSPECTED   Risk engine blocked bet

------------------------------------------------------------------------

## Validation Rules Summary

### Number Selection

-   range: **1--80**
-   unique: **no duplicates allowed**
-   quantity: **1--10 numbers per bet**

### Stake Validation

-   minimum stake enforced
-   maximum stake enforced
-   configurable per operator

### Round Validation

-   round must be **OPEN**
-   cutoff time respected
-   no bets after closing time

### Maximum Win Limits

-   potential winnings computed prior to bet placement
-   bet rejected when exceeding **operator or jurisdiction limits**

### Anti‑Fraud Triggers

-   IP velocity checks
-   device fingerprint monitoring
-   duplicate bet detection
-   abnormal payout pattern identification

------------------------------------------------------------------------

## Regulatory Audit Behavior

All rejected transactions are:

-   logged with timestamp
-   stored with operator ID and player ID hash
-   exportable for regulators
-   retained according to licensing rules

------------------------------------------------------------------------

End of document.
