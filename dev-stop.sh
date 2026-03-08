#!/bin/bash

# =============================================================================
# TaskMaster - Stop Development Services
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

LOG_DIR="logs"

echo "======================================"
echo "  Stopping TaskMaster Services"
echo "======================================"
echo ""

if [ ! -d "$LOG_DIR" ]; then
    echo -e "${YELLOW}No running services found.${NC}"
    exit 0
fi

# Stop all services
stopped_count=0
for pidfile in "$LOG_DIR"/*.pid; do
    if [ -f "$pidfile" ]; then
        service_name=$(basename "$pidfile" .pid)
        pid=$(cat "$pidfile")
        
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}🛑 Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
            stopped_count=$((stopped_count + 1))
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        fi
        
        rm "$pidfile"
    fi
done

echo ""
if [ $stopped_count -gt 0 ]; then
    echo -e "${GREEN}🎉 Stopped $stopped_count service(s)${NC}"
else
    echo -e "${YELLOW}No running services found.${NC}"
fi
echo ""
