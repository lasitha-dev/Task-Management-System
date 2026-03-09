#!/bin/bash

# =============================================================================
# TaskMaster - Complete System Startup Script
# =============================================================================
# This script starts all microservices with one command
# Supports both Docker and Development modes
# =============================================================================

set -e

echo "======================================"
echo "  TaskMaster System Startup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running.${NC}"
    echo -e "${BLUE}🔄 Switching to Development Mode...${NC}"
    echo ""
    echo -e "${GREEN}Starting services without Docker...${NC}"
    exec ./dev-start.sh
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from defaults...${NC}"
    cat > .env << 'EOF'
# JWT Configuration (MUST BE THE SAME ACROSS ALL SERVICES)
JWT_SECRET=4a071af79eaf92a78d3ab48a3f7b0770624e462a5e6c59440ad0630828b1eac9
JWT_EXPIRE=30d
INTERNAL_SERVICE_TOKEN=taskmaster_internal_notifications_token_2026

# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=admin123

# Email Configuration (for notifications service)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Environment
NODE_ENV=production

# Google OAuth (optional)
GOOGLE_CLIENT_ID=995578316094-qdi6aqve8ksss8coga91353b49ea7veh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
fi

echo ""
echo "Starting TaskMaster system with Docker Compose..."
echo ""

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start all services
echo ""
echo "🏗️  Building and starting all services..."
docker-compose up --build -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🔍 Checking service health..."
echo ""

services=(
    "http://localhost:8000/health|API Gateway"
    "http://localhost:5001/health|User Management"
    "http://localhost:5002/health|Task Management"
    "http://localhost:5003/health|Notifications"
    "http://localhost:5004/health|Reporting Analytics"
)

all_healthy=true

for service in "${services[@]}"; do
    IFS='|' read -r url name <<< "$service"
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - $url"
    else
        echo -e "${RED}❌ $name${NC} - $url (not responding)"
        all_healthy=false
    fi
done

echo ""
echo "======================================"
if [ "$all_healthy" = true ]; then
    echo -e "${GREEN}🎉 All services are running!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be starting...${NC}"
    echo "Run 'docker-compose logs -f' to see detailed logs"
fi
echo "======================================"
echo ""
echo "📱 Access the applications:"
echo ""
echo "   🔐 User Management:      http://localhost:3000"
echo "   📋 Task Management:       http://localhost:3001"
echo "   🔔 Notifications:        http://localhost:3002"
echo "   🚪 API Gateway:           http://localhost:8000"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop all services:"
echo "   docker-compose down"
echo ""
echo "💾 Stop and remove all data:"
echo "   docker-compose down -v"
echo ""
