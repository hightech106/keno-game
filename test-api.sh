#!/bin/bash

# Quick API Testing Script
# Usage: ./test-api.sh

API_URL="http://localhost:3000"

echo "🧪 Testing Keno Game Platform API"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        if [ ! -z "$body" ]; then
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "$body"
    fi
    echo ""
}

# Check if server is running
echo "Checking if server is running..."
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server is running${NC}"
    echo ""
else
    echo -e "${RED}✗ Server is not running${NC}"
    echo "Please start the server first: cd src/backend && npm run start:dev"
    exit 1
fi

# 1. Health Check
test_endpoint "GET" "/health" "" "Health Check"

# 2. Detailed Health Check
test_endpoint "GET" "/health/detailed" "" "Detailed Health Check"

# 3. Get Current Round
test_endpoint "GET" "/rounds/current" "" "Get Current Round"

# Save round ID for later tests
ROUND_ID=$(curl -s "$API_URL/rounds/current" | jq -r '.roundId' 2>/dev/null)
if [ ! -z "$ROUND_ID" ] && [ "$ROUND_ID" != "null" ]; then
    echo "Current Round ID: $ROUND_ID"
    echo ""
fi

# 4. Place a Bet
BET_DATA='{
  "operatorId": "op-1",
  "playerId": "player-1",
  "currency": "USD",
  "stake": 10.0,
  "selections": [1, 2, 3, 4, 5]
}'
test_endpoint "POST" "/bets" "$BET_DATA" "Place Bet"

# Save bet ID
BET_ID=$(curl -s -X POST "$API_URL/bets" \
    -H "Content-Type: application/json" \
    -d "$BET_DATA" | jq -r '.betId' 2>/dev/null)

if [ ! -z "$BET_ID" ] && [ "$BET_ID" != "null" ]; then
    echo "Bet ID: $BET_ID"
    echo ""
    
    # 5. Get Bet Status
    test_endpoint "GET" "/bets/$BET_ID" "" "Get Bet Status"
fi

# 6. Login (JWT)
LOGIN_DATA='{"operatorId": "op-1"}'
test_endpoint "POST" "/auth/login" "$LOGIN_DATA" "Login (JWT)"

# Get token
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_DATA" | jq -r '.access_token' 2>/dev/null)

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "Token received: ${TOKEN:0:20}..."
    echo ""
    
    # 7. Admin Endpoints (with token)
    echo "Testing Admin Endpoints (requires JWT)..."
    echo ""
    
    # Get Recent Rounds
    echo -n "Testing Get Recent Rounds... "
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/admin/rounds?limit=5" \
        -H "Authorization: Bearer $TOKEN")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    fi
    echo ""
    
    # Get Statistics
    echo -n "Testing Get Statistics... "
    response=$(curl -s -w "\n%{http_code}" -X GET "$API_URL/admin/stats" \
        -H "Authorization: Bearer $TOKEN")
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $http_code)"
        echo "$response" | sed '$d' | jq '.' 2>/dev/null || echo "$response" | sed '$d'
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
    fi
    echo ""
fi

# 8. Fairness Verification (if round completed)
if [ ! -z "$ROUND_ID" ] && [ "$ROUND_ID" != "null" ]; then
    echo "Testing Fairness Verification..."
    echo "Note: Requires completed round with seeds"
    echo ""
fi

echo ""
echo "=================================="
echo -e "${GREEN}Testing Complete!${NC}"
echo ""
echo "📚 API Documentation: $API_URL/api-docs"
echo "🔍 Health Check: $API_URL/health"
echo ""
