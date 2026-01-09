# Quick API Testing Script for Windows PowerShell
# Usage: .\test-api.ps1

$API_URL = "http://localhost:3000"

Write-Host "🧪 Testing Keno Game Platform API" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Test function
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null,
        [string]$Description,
        [string]$Token = $null
    )
    
    Write-Host -NoNewline "Testing $Description... "
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Data) {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body $Data -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -ErrorAction Stop
        }
        
        Write-Host "✓ PASS" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ FAIL (HTTP $statusCode)" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        return $null
    }
    Write-Host ""
}

# Check if server is running
Write-Host "Checking if server is running..."
try {
    $health = Invoke-RestMethod -Uri "$API_URL/health" -ErrorAction Stop
    Write-Host "✓ Server is running" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Server is not running" -ForegroundColor Red
    Write-Host "Please start the server first: cd src/backend && npm run start:dev"
    exit 1
}

# 1. Health Check
Test-Endpoint -Method "GET" -Endpoint "/health" -Description "Health Check"

# 2. Detailed Health Check
Test-Endpoint -Method "GET" -Endpoint "/health/detailed" -Description "Detailed Health Check"

# 3. Get Current Round
$currentRound = Test-Endpoint -Method "GET" -Endpoint "/rounds/current" -Description "Get Current Round"
$roundId = $currentRound.roundId
if ($roundId) {
    Write-Host "Current Round ID: $roundId" -ForegroundColor Yellow
    Write-Host ""
}

# 4. Place a Bet
$betData = @{
    operatorId = "op-1"
    playerId = "player-1"
    currency = "USD"
    stake = 10.0
    selections = @(1, 2, 3, 4, 5)
} | ConvertTo-Json

$betResult = Test-Endpoint -Method "POST" -Endpoint "/bets" -Data $betData -Description "Place Bet"
$betId = $betResult.betId
if ($betId) {
    Write-Host "Bet ID: $betId" -ForegroundColor Yellow
    Write-Host ""
    
    # 5. Get Bet Status
    Test-Endpoint -Method "GET" -Endpoint "/bets/$betId" -Description "Get Bet Status"
}

# 6. Login (JWT)
$loginData = @{
    operatorId = "op-1"
} | ConvertTo-Json

$loginResult = Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Data $loginData -Description "Login (JWT)"
$token = $loginResult.access_token

if ($token) {
    Write-Host "Token received: $($token.Substring(0, [Math]::Min(20, $token.Length)))..." -ForegroundColor Yellow
    Write-Host ""
    
    # 7. Admin Endpoints (with token)
    Write-Host "Testing Admin Endpoints (requires JWT)..." -ForegroundColor Cyan
    Write-Host ""
    
    # Get Recent Rounds
    Test-Endpoint -Method "GET" -Endpoint "/admin/rounds?limit=5" -Description "Get Recent Rounds" -Token $token
    
    # Get Statistics
    Test-Endpoint -Method "GET" -Endpoint "/admin/stats" -Description "Get Statistics" -Token $token
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 API Documentation: $API_URL/api-docs" -ForegroundColor Yellow
Write-Host "🔍 Health Check: $API_URL/health" -ForegroundColor Yellow
Write-Host ""
