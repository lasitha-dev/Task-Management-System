#!/bin/bash

# =============================================================================
# TaskMaster - Development Mode Startup Script
# =============================================================================
# This script automatically installs dependencies and starts all services
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Log file
LOG_DIR="logs"
mkdir -p "$LOG_DIR"

echo "======================================"
echo "  TaskMaster Development Mode"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"
echo ""

# Array of services to start
declare -a SERVICES=(
    "api-gateway:8000"
    "user-management:5001"
    "task-management:5002"
    "notifications-management:5003"
    "user-management/frontend:3000"
    "task-management/frontend:3001"
    "notifications-management/frontend:3002"
)

# Function to install dependencies if needed
install_dependencies() {
    local service_path=$1
    local service_name=$2
    
    if [ ! -d "$service_path/node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies for $service_name...${NC}"
        cd "$service_path"
        npm install --silent > "$LOG_DIR/${service_name}-install.log" 2>&1
        cd - > /dev/null
        echo -e "${GREEN}✅ $service_name dependencies installed${NC}"
    else
        echo -e "${CYAN}✓ $service_name dependencies already installed${NC}"
    fi
}

# Function to start a service
start_service() {
    local service_path=$1
    local service_name=$2
    local port=$3
    
    echo -e "${BLUE}🚀 Starting $service_name on port $port...${NC}"
    cd "$service_path"
    
    # Start the service in background
    if [ -f "package.json" ]; then
        npm run dev > "../$LOG_DIR/${service_name}.log" 2>&1 &
        local pid=$!
        echo "$pid" > "../$LOG_DIR/${service_name}.pid"
        echo -e "${GREEN}✅ $service_name started (PID: $pid)${NC}"
    fi
    
    cd - > /dev/null
}

# Stop existing services
echo -e "${YELLOW}🛑 Stopping any existing services...${NC}"
if [ -d "$LOG_DIR" ]; then
    for pidfile in "$LOG_DIR"/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
            rm "$pidfile"
        fi
    done
fi
echo ""

# Install dependencies and start services
echo -e "${CYAN}📦 Checking and installing dependencies...${NC}"
echo ""

for service in "${SERVICES[@]}"; do
    IFS=':' read -r path port <<< "$service"
    service_name=$(echo "$path" | tr '/' '-')
    
    if [ -d "$path" ]; then
        install_dependencies "$path" "$service_name"
    else
        echo -e "${YELLOW}⚠️  Service directory not found: $path${NC}"
    fi
done

echo ""
echo -e "${CYAN}🚀 Starting all services...${NC}"
echo ""

# Start all services
for service in "${SERVICES[@]}"; do
    IFS=':' read -r path port <<< "$service"
    service_name=$(echo "$path" | tr '/' '-')
    
    if [ -d "$path" ]; then
        start_service "$path" "$service_name" "$port"
        sleep 2
    fi
done

echo ""
echo -e "${YELLOW}⏳ Waiting for services to initialize (15 seconds)...${NC}"
sleep 15

# Check service health
echo ""
echo -e "${CYAN}🔍 Checking service health...${NC}"
echo ""

check_service() {
    local url=$1
    local name=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - $url"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - $url (not responding yet)"
        return 1
    fi
}

all_healthy=true

check_service "http://localhost:8000/health" "API Gateway" || all_healthy=false
check_service "http://localhost:5001/health" "User Management" || all_healthy=false
check_service "http://localhost:5002/health" "Task Management" || all_healthy=false
check_service "http://localhost:5003/health" "Notifications" || all_healthy=false
check_service "http://localhost:3000" "User Frontend" || all_healthy=false
check_service "http://localhost:3001" "Task Frontend" || all_healthy=false
check_service "http://localhost:3002" "Notifications Frontend" || all_healthy=false

echo ""
echo "======================================"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}🎉 All services are running!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be starting...${NC}"
    echo -e "${YELLOW}    Check logs in the 'logs/' directory${NC}"
fi
echo "======================================"
echo ""
echo -e "${CYAN}📱 Access the applications:${NC}"
echo ""
echo -e "   ${GREEN}🔐 User Login:${NC}        http://localhost:3000"
echo -e "   ${GREEN}📋 Task Dashboard:${NC}    http://localhost:3001"
echo -e "   ${GREEN}🔔 Notifications:${NC}     http://localhost:3002"
echo -e "   ${GREEN}🚪 API Gateway:${NC}       http://localhost:8000"
echo ""
echo -e "${CYAN}📊 View logs:${NC}"
echo -e "   tail -f logs/api-gateway.log"
echo -e "   tail -f logs/user-management.log"
echo -e "   tail -f logs/task-management.log"
echo -e "   tail -f logs/notifications-management.log"
echo -e "   tail -f logs/user-management-frontend.log"
echo -e "   tail -f logs/task-management-frontend.log"
echo -e "   tail -f logs/notifications-management-frontend.log"
echo ""
echo -e "${CYAN}🛑 Stop all services:${NC}"
echo -e "   ./dev-stop.sh"
echo ""
echo -e "${CYAN}🔄 Restart services:${NC}"
echo -e "   ./dev-stop.sh && ./dev-start.sh"
echo ""
