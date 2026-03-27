#!/bin/bash

# Только новая платформа (frontend) на порту 3001

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[frontend]${NC} http://localhost:3001"
echo ""

cd "$(dirname "$0")/frontend" || exit 1
exec npm run dev -- --port 3001
