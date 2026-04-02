#!/bin/bash


GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${GREEN}[frontend]${NC} http://localhost:3000"
echo -e "ATS: мобильная карточка кандидата — при ширине окна до 900px (или режим устройства в DevTools)."
echo -e "Если UI «застыл»: остановите dev-сервер, снова запустите этот скрипт (vite --force сбрасывает кэш deps)."
echo ""

cd "$(dirname "$0")/frontend" || exit 1
exec npm run dev -- --port 3000 --force
