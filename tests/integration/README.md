# Integration Tests

This directory contains integration tests that test the complete system flow, including database interactions, service coordination, and API endpoints.

## Test Structure

### Test Setup (`test-setup.ts`)
- Creates test module with database connection
- Provides cleanup utilities
- Handles test database lifecycle

### Test Files

1. **`round-lifecycle.integration.spec.ts`**
   - Tests complete round lifecycle (OPEN → CLOSING → DRAWING → SETTLING → PAYOUT → ARCHIVED)
   - Tests number generation
   - Tests state transitions
   - Tests seed consistency

2. **`bet-settlement.integration.spec.ts`**
   - Tests bet placement flow
   - Tests settlement process
   - Tests hit calculation
   - Tests payout calculation
   - Tests multiple bets in one round
   - Tests bet validation

3. **`api-endpoints.integration.spec.ts`**
   - Tests REST API endpoints
   - Tests request/response formats
   - Tests error handling
   - Tests authentication (when enabled)

## Running Integration Tests

### Prerequisites

1. **Test Database Setup**
   Create a test database:
   ```sql
   CREATE DATABASE keno_test;
   ```

2. **Environment Variables**
   Create `.env.test` file:
   ```env
   TEST_DB_HOST=localhost
   TEST_DB_PORT=5432
   TEST_DB_USER=postgres
   TEST_DB_PASSWORD=postgres
   TEST_DB_NAME=keno_test
   ```

### Run Tests

```bash
# Run all integration tests
npm test -- tests/integration

# Run specific test file
npm test -- tests/integration/round-lifecycle.integration.spec.ts

# Run with coverage
npm test -- --coverage tests/integration
```

## Test Database

Integration tests use a separate test database to avoid affecting development data. The test database is:
- Automatically created/dropped per test run
- Synchronized with entity schemas
- Cleaned between tests

## Notes

- Tests use real database connections (not mocks)
- Tests verify complete end-to-end flows
- Tests are slower than unit tests but more comprehensive
- Database cleanup happens automatically

## Future Enhancements

- [ ] Add test fixtures for common scenarios
- [ ] Add performance benchmarks
- [ ] Add concurrent request tests
- [ ] Add WebSocket integration tests
- [ ] Add wallet integration tests
