# JWT Authentication Implementation

## ✅ Completed

### 1. Core Authentication Components

#### JWT Strategy (`src/backend/auth/strategies/jwt.strategy.ts`)
- ✅ Passport JWT strategy implementation
- ✅ Token extraction from Authorization header
- ✅ Operator validation on token verification
- ✅ Active status check for operators

#### Auth Service (`src/backend/auth/services/auth.service.ts`)
- ✅ Token generation with JWT
- ✅ Login endpoint logic
- ✅ Token validation
- ✅ Configurable expiration times

#### JWT Auth Guard (`src/backend/auth/guards/jwt-auth.guard.ts`)
- ✅ Full Passport integration
- ✅ Support for `@Public()` decorator to bypass auth
- ✅ Automatic token verification

#### Auth Controller (`src/backend/auth/controllers/auth.controller.ts`)
- ✅ `POST /auth/login` - Operator login endpoint
- ✅ Returns JWT token with expiration

### 2. Decorators

- ✅ `@Public()` - Mark routes as public (no auth required)
- ✅ `@Operator()` - Extract operator from headers (legacy)
- ✅ `@CurrentOperator()` - Extract operator from JWT token

### 3. Module Integration

- ✅ AuthModule created with JWT configuration
- ✅ Added to AppModule
- ✅ Global guard available (commented out for development)

### 4. Public Endpoints

The following endpoints are marked as `@Public()` (no authentication required):
- `GET /rounds/current` - Get current round
- `GET /rounds/:roundId/result` - Get round results
- `GET /fairness/verify` - Fairness verification
- `POST /auth/login` - Login endpoint

### 5. Protected Endpoints

The following endpoints require authentication (when global guard is enabled):
- `POST /bets` - Place bet
- `GET /bets/:betId` - Get bet status
- `POST /bets/rollback` - Rollback bet
- `GET /rounds/:roundId` - Get round details

---

## 🔧 Configuration

### Environment Variables

Add to `.env` file:

```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
```

### Enabling Authentication

To enable authentication globally, uncomment in `app.module.ts`:

```typescript
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
],
```

---

## 📝 Usage

### 1. Operator Login

```bash
POST /auth/login
Content-Type: application/json

{
  "operatorId": "op-1",
  "apiKey": "optional-api-key"
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "operatorId": "op-1"
}
```

### 2. Using Token in Requests

```bash
GET /bets/BET-123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Accessing Operator in Controllers

```typescript
import { CurrentOperator } from '../auth/decorators/current-operator.decorator';

@Get('profile')
getProfile(@CurrentOperator() operator: { operatorId: string, operator: Operator }) {
  return operator;
}
```

---

## 🚧 Next Steps

### Production Readiness

1. **API Key Management**
   - Store operator API keys securely
   - Implement API key verification in AuthService
   - Add key rotation support

2. **HMAC Request Signing**
   - Implement HMAC signature verification
   - Add timestamp and nonce validation
   - Prevent replay attacks

3. **Rate Limiting**
   - Add rate limiting per operator
   - Use Redis for distributed rate limiting
   - Implement IP allowlisting

4. **Token Refresh**
   - Add refresh token mechanism
   - Implement token rotation
   - Handle token expiration gracefully

5. **Audit Logging**
   - Log all authentication attempts
   - Track token usage
   - Monitor suspicious activity

---

## 🔒 Security Notes

- **Development Mode**: Global guard is commented out for easier development
- **Production**: Must enable global guard and set strong JWT_SECRET
- **Token Storage**: Never store tokens in localStorage in production (use httpOnly cookies)
- **HTTPS**: Always use HTTPS in production
- **Secret Rotation**: Implement JWT secret rotation strategy

---

## 📊 Current Status

- ✅ JWT authentication fully implemented
- ✅ Token generation and verification working
- ✅ Public/private route support
- ⚠️ Global guard disabled (development mode)
- ⚠️ API key verification placeholder (needs implementation)
- ⚠️ HMAC signing not yet implemented

**Authentication Completion: ~80%**

Ready for:
- Production configuration
- API key management
- HMAC signing layer
- Rate limiting
