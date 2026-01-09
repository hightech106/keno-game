# Keno Game Test Suite

This directory contains unit tests for the Keno Game backend services.

## Running Tests

To run the full test suite:

```bash
npm test
```

To run a specific test file:

```bash
npx jest tests/unit/bet/bet.service.spec.ts
```

## Coverage

The unit tests cover the following critical modules:

### 1. Bet Module
- **BetService**: Validates round status, operator config, stake limits, duplicate selections, and wallet debiting.

### 2. Round Module
- **RoundService**: Tests round creation, state transitions (OPEN -> CLOSING -> DRAWING -> SETTLING), and gateway event emission.
- **RoundLifecycleService**: Verifies valid state transitions and lifecycle flow.

### 3. Operator Module
- **OperatorService**: Tests retrieval of operator configurations and default fallbacks.

### 4. Payout Module
- **SettlementService**: Tests batch processing of bets, hit calculation, win/loss determination, and wallet crediting.
- **PayoutCalculationService**: Verifies payout multipliers and amounts.

### 5. Game Engine
- **NumberDrawService**: Tests RNG logic (if applicable).
- **HitDetectionService**: Tests matching logic between user selections and drawn numbers.

## Mocking

Tests use Jest mocks for:
- TypeORM Repositories (`getRepositoryToken`)
- External Services (Wallet Provider)
- Cross-module dependencies
