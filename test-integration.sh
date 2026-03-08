#!/bin/bash

# Test Integration Script
# This verifies all services are running and tests the authentication flow

echo "======================================"
echo "  Testing TaskMaster Integration"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check services
echo "Checking service health..."
echo ""

check_service() {
    local url=$1
    local name=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - Running"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - Not responding"
        return 1
    fi
}

all_healthy=true

check_service "http://localhost:8000/health" "API Gateway (8000)" || all_healthy=false
check_service "http://localhost:5001/health" "User Management (5001)" || all_healthy=false
check_service "http://localhost:5002/health" "Task Management (5002)" || all_healthy=false
check_service "http://localhost:3000" "User Frontend (3000)" || all_healthy=false
check_service "http://localhost:3001" "Task Frontend (3001)" || all_healthy=false

echo ""
if [ "$all_healthy" = false ]; then
    echo -e "${RED}❌ Not all services are running!${NC}"
    echo ""
    echo "Please start all services first:"
    echo "  Terminal 1: cd api-gateway && npm run dev"
    echo "  Terminal 2: cd user-management && npm run dev"
    echo "  Terminal 3: cd task-management && npm run dev"
    echo "  Terminal 4: cd user-management/frontend && npm run dev"
    echo "  Terminal 5: cd task-management/frontend && npm run dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ All services are running!${NC}"
echo ""
echo "======================================"
echo "  Integration Test Results"
echo "======================================"
echo ""

# Test 1: Register a new user
echo "Test 1: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/users/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Integration Test\",\"email\":\"integration$(date +%s)@test.com\",\"password\":\"test123456\"}")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    echo -e "${GREEN}✅ Registration successful${NC}"
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo -e "${YELLOW}⚠️  Using existing test user${NC}"
    # Try login with existing user
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/users/login \
        -H "Content-Type: application/json" \
        -d '{"email":"testuser@example.com","password":"password123"}')
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo ""

# Test 2: Access protected endpoint
echo "Test 2: JWT Authentication"
PROFILE_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/users/profile" \
    -H "Authorization: Bearer $TOKEN")

if echo "$PROFILE_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ JWT authentication working${NC}"
    echo "   User: $(echo "$PROFILE_RESPONSE" | grep -o '"name":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}❌ JWT authentication failed${NC}"
fi

echo ""

# Test 3: Create a task
echo "Test 3: Task Creation (Cross-service)"
TASK_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/tasks" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Integration Test Task","description":"Testing microservices integration","status":"todo","priority":"high"}')

if echo "$TASK_RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Cross-service communication working${NC}"
    echo "   Task created via API Gateway"
else
    echo -e "${RED}❌ Cross-service communication failed${NC}"
fi

echo ""
echo "======================================"
echo "  Access Points"
echo "======================================"
echo ""
echo "🔐 Login Page:         http://localhost:3000"
echo "📋 Task Dashboard:     http://localhost:3001"
echo "🚪 API Gateway:        http://localhost:8000"
echo ""
echo "After login at port 3000, you will be automatically redirected to port 3001"
echo ""
