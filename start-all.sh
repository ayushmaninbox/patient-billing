#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}        MedTrack Pro - Healthcare Suite 2.0       ${NC}"
echo -e "${BLUE}==================================================${NC}"

# Clear old PIDs and Logs
rm -f .pids
rm -f billing-service/*.log patient-service/*.log

function start_backend() {
    local dir=$1
    local port=$2
    local log=$3
    
    echo -n "Starting $dir... "
    cd "$dir"
    
    # We use -DskipTests to boot faster
    # Clear local corruption before start
    ./mvnw spring-boot:run -DskipTests > "$log" 2>&1 &
    
    local pid=$!
    echo "$pid" >> ../.pids
    cd ..
    echo -e "${GREEN}INIT (PID: $pid)${NC}"
}

# 1. Start Backends
start_backend "billing-service" 8082 "billing.log"
start_backend "patient-service" 8081 "patient.log"

# 2. Start Frontend
echo -n "Launching MedTrack Pro Interface... "
cd frontend
npm install > /dev/null 2>&1
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> ../.pids
cd ..
echo -e "${GREEN}READY${NC}"

echo -e "\n${BLUE}==================================================${NC}"
echo -e "${GREEN}MEDTRACK PRO SYSTEMS ONLINE${NC}"
echo -e "Portal:  ${BLUE}http://localhost:5173${NC}"
echo -e "Action:  Search for 'P101' in the top bar"
echo -e "Stop:    ./stop-all.sh"
echo -e "${BLUE}==================================================${NC}"
