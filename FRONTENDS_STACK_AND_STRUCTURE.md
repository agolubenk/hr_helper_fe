# Фронтенды в репозитории: стек и структура

В репозитории **три приложения** и **три скрипта запуска** в корне.

---

## Порты и скрипты запуска (только рабочие)

| Порт | Приложение | Папка | Как запустить |
|------|------------|-------|---------------|
| **3000** | Новая платформа (Vite, TanStack Router) | `frontend/` | `./start-dev-new.sh` |
| **3001** | Legacy Next.js | `frontend old/` | в паре со скриптами ниже |
| **3002** | Миграция legacy на Vite (сравнение с 3001) | `fe_migration/` | в паре со скриптом миграции |

### Три файла в корне репозитория

| Скрипт | Назначение |
|--------|------------|
| **`start-dev.sh`** | Одновременно: **3001** (Next, `frontend old`) + **3000** (Vite, `frontend`). |
| **`start-dev-migration.sh`** | Одновременно: **3001** (эталон Next) + **3002** (`fe_migration`) — сравнение переноса. |
| **`start-dev-new.sh`** | Только **3000** — разработка новой платформы без legacy. |
| **`start-dev-old.sh`** | Только **3001** — только legacy Next (frontend old). |

**Только** fe_migration на 3002: `cd fe_migration && npm run dev`.  
**Только** миграция на 3002: `cd fe_migration && npm run dev`.

---

## Сводная таблица стеков

| | **frontend old** | **frontend** | **fe_migration** |
|---|------------------|--------------|------------------|
| **Папка** | `frontend old/` | `frontend/` | `fe_migration/` |
| **Сборщик** | Next.js 14 | Vite 5 | Vite 5 |
| **Роутинг** | App Router | TanStack Router | React Router DOM 7 |
| **Порт dev** | 3001 | 3000 | 3002 |
| **Алиас TS** | `@/*` → корень проекта | `@/*` → `src/` | `@/*` → `src/` |
| **UI** | Radix, bootstrap-icons, react-icons | Radix, lucide, react-icons | как у legacy |
| **Назначение** | эталон legacy | целевая платформа | перенос legacy 1:1 без FSD |

---

## `frontend old` — legacy (Next.js)

### Стек (из `package.json`)

- **next** ^14.2.5, **react** ^18.3  
- **@radix-ui/themes**, **@dnd-kit/***, **react-icons**, **bootstrap-icons**  
- **driver.js**, **jszip**, **mammoth**, **pptx2html**, **xlsx**  

### Структура (кратко)

```
frontend old/
├── app/                 # page.tsx, layout.tsx
├── components/
├── lib/
├── public/
├── next.config.js       # редиректы /finance, /admin-crm
└── tsconfig.json        # "@/*" → "./*"
```

Импорты **`@/`** с корня (`components/`, `lib/`).

---

## `frontend` — новая платформа (Vite + TanStack Router)

- **@tanstack/react-router**, **react-query**, **zustand**, **@tiptap/***, **Vitest**, **Storybook**  
- Дерево: `src/app/router`, `src/features/`, `src/entities/`, `src/shared/`  
- Роуты: **`src/app/router/index.tsx`**  
- Dev: порт **3000** через `start-dev-new.sh` или `start-dev.sh`

---

## `fe_migration/` — миграция стека без смены архитектуры на FSD

- Базовый эталон переноса: **frontend old (3001)** → сравнение **`./start-dev-migration.sh`** (3001 + 3002).  
- **Мастер-план остаточной миграции:** **`Детальный план остаточной миграции hr_helper_fe.md`** (корень репо); сводка статуса по фазам — **`fe_migration/docs/DETAILED_PLAN_STATUS.md`**.  
- План переноса страниц и чек-листы: **`MIGRATION_PLAN.md`** (корень репо; фазы A–K, I, J; код живёт в `fe_migration/`).  
- **Очередь нерешённого** (приёмка фаза 14, хвосты): **`MIGRATION_PLAN_UPD.md`** (корень репо).  
- **Расхождения с эталоном 3001** (намеренные и найденные при приёмке): **`fe_migration/docs/MIGRATION_DIVERGENCES.md`**.  
- Отдельно зафиксирована **доработка UI профиля и оболочки** под новую платформу (**frontend :3000**): **`fe_migration/docs/UI_MIGRATION_PLAN.md`** (футер, FloatingActions, тема, соцсети, UserCard и т.д.).  
- В текущем цикле миграции из доработок **исключены**: `Sidebar`, `Header`, `Footer`, `FloatingActions` (у `FloatingActions` зафиксирован `left: 12px`).  
- **`src/router-adapter.tsx`** вместо `next/link` и `next/navigation`.

---

## Зачем этот документ

1. Различие трёх приложений и **трёх скриптов** запуска.  
2. При переносе экрана в **fe_migration** — следовать **`MIGRATION_PLAN.md`** (корень репо) и мастер-плану **`Детальный план остаточной миграции hr_helper_fe.md`**.  
3. При поиске legacy-кода — `frontend old/app/`, `frontend old/components/`.

---

## Миграция и качество переноса

- Перенос legacy-страниц (3001 → 3002): **`MIGRATION_PLAN.md`** + статус фаз **`fe_migration/docs/DETAILED_PLAN_STATUS.md`**.  
- Нерешённое и отложенное: **`MIGRATION_PLAN_UPD.md`**.  
- UI-изменения и parity с **3000** по профилю/хедеру/футеру: **`fe_migration/docs/UI_MIGRATION_PLAN.md`**.  
- После переноса каждой страницы: сверка построчно (**I**), чек-лист (**J**), таблица учёта (**G**).
