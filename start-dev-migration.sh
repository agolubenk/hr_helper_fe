#!/bin/bash

# Только миграционный фронт (fe_migration) на порту 3000

GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[frontend]${NC} http://localhost:3000"
echo ""

cd "$(dirname "$0")/fe_migration" || exit 1
exec npm run dev -- --port 3000
