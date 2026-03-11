#!/bin/bash

# Colors for output
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}Stopping all services...${NC}"

if [ -f .pids ]; then
    while read p; do
        echo "Killing PID $p"
        kill -9 $p > /dev/null 2>&1
    done < .pids
    rm .pids
    echo -e "${RED}Services stopped.${NC}"
else
    echo "No .pids file found. Trying to kill by port..."
    lsof -ti:8081,8082,5173 | xargs kill -9 > /dev/null 2>&1
    echo -e "${RED}Services stopped (if they were running).${NC}"
fi
