#!/bin/bash

# HR Helper - запуск обоих фронтендов
# Старый (Next.js): http://localhost:3000
# Новый (Vite):     http://localhost:3001

echo "🚀 Запуск HR Helper Frontend..."
echo ""

# Цвета для вывода
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Функция для завершения всех процессов при Ctrl+C
cleanup() {
    echo ""
    echo "⏹️  Остановка серверов..."
    kill $PID_OLD $PID_NEW 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Запуск старого фронтенда (Next.js)
echo -e "${BLUE}[OLD]${NC} Запуск Next.js на порту 3000..."
cd "frontend old" && npm run dev &
PID_OLD=$!

# Небольшая пауза перед запуском второго
sleep 2

# Запуск нового фронтенда (Vite)
echo -e "${GREEN}[NEW]${NC} Запуск Vite на порту 3001..."
cd ../frontend && npm run dev &
PID_NEW=$!

echo ""
echo "✅ Оба сервера запущены!"
echo ""
echo "   📦 Старый фронтенд (Next.js): http://localhost:3000"
echo "   ⚡ Новый фронтенд (Vite):     http://localhost:3001"
echo ""
echo "Нажмите Ctrl+C для остановки обоих серверов"
echo ""

# Ожидание завершения
wait
