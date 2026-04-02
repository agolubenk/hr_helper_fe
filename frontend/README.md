# fe_migration — миграция «frontend old» на новый стек

Приложение-клон старого фронта (Next.js) на стеке **Vite + React + TypeScript + React Router**.  
Сейчас меняется **только стек**; роуты, ссылки и структура приложения сохраняются для последующей миграции без потери логики.

## Стек

| | Было (frontend old) | Стало (fe_migration) |
|---|---------------------|----------------------|
| Сборка | Next.js 14 | Vite 5 |
| Роутинг | Next App Router (file-based) | React Router DOM 7 |
| Навигация | `next/link`, `next/navigation` | Адаптер `src/router-adapter.tsx` |

Зависимости UI и логики те же: Radix Themes, react-icons, driver.js, jszip, mammoth, xlsx и т.д.

## Запуск

```bash
npm install
npm run dev
```

Приложение доступно на **http://localhost:3002** (порт задан в `vite.config.ts` и `package.json`).  
Сравнение с эталоном Next: в корне репо **`./start-dev-migration.sh`** (3001 + 3002).

## Структура

- **`src/app/`** — точка входа (`App.tsx`, `main.tsx`), глобальные стили, страницы (пока только `HomePage`).
- **`src/components/`** — скопированы из `frontend old/components`; импорты `next/link` и `next/navigation` заменены на `@/router-adapter`.
- **`src/lib/`** — утилиты и типы из `frontend old/lib`; для API используется `import.meta.env.VITE_API_URL`.
- **`src/router-adapter.tsx`** — обёртка над React Router: `usePathname`, `useRouter`, `useParams`, `Link` с API, совместимым с Next.

## Что сделано на первом этапе

1. Поднят Vite-проект с тем же набором зависимостей, что и у «frontend old».
2. Перенесены `public/`, `lib/`, `app/globals.css`, стили тура и главной страницы.
3. Перенесены провайдеры и layout: `ThemeProvider`, `ToastProvider`, `AppLayout`, `Header`, `Sidebar`, `FloatingActions`, `StatusBar`.
4. Подключён React Router; главная страница `/` рендерит тот же контент, что и `app/page.tsx` (карточки разделов, приветственный тур).
5. Все импорты Next в скопированных компонентах заменены на `router-adapter`; добавлена заглушка типов `app/aichat/page.ts` для компонентов aichat.

Дальше: добавление остальных роутов по мере переноса страниц без изменения их логики и структуры.

**Пошаговый план переноса (страницы, стили, вёрстка, логика):** см. **[MIGRATION_PLAN.md](./MIGRATION_PLAN.md)**.
