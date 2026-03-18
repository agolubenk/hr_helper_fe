#!/bin/bash
# Только frontend old (Next.js) на 3001
cd "$(dirname "$0")/frontend old" || exit 1
exec npx next dev -p 3001
