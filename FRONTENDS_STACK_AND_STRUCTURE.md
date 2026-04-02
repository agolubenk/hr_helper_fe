# Фронтенды в репозитории: стек и структура

На текущем этапе в репозитории **поддерживается только миграционный фронт** `fe_migration/`.

---

## Порт и скрипт запуска (актуально)

| Порт | Приложение | Папка | Как запустить |
|------|------------|-------|---------------|
| **3000** | Миграция legacy на Vite | `fe_migration/` | `./start-dev-migration.sh` |

### Скрипты в корне репозитория

| Скрипт | Назначение |
|--------|------------|
| **`start-dev-migration.sh`** | Только **3000** (`fe_migration`) — работа с миграцией. |

**Только** fe_migration на 3000: `cd fe_migration && npm run dev -- --port 3000`.

---

## Сводная таблица стеков

| | **frontend old** | **fe_migration** |
|---|------------------|------------------|
| **Папка** | `frontend old/` | `fe_migration/` |
| **Сборщик** | Next.js 14 | Vite 5 |
| **Роутинг** | App Router | React Router DOM 7 |
| **Порт dev** | 3001 (архив) | 3000 |
| **Алиас TS** | `@/*` → корень проекта | `@/*` → `src/` |
| **UI** | Radix, bootstrap-icons, react-icons | как у legacy |
| **Назначение** | эталон legacy | перенос legacy 1:1 без FSD |

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

## `fe_migration/` — миграция стека без смены архитектуры на FSD

- Базовый эталон переноса: **frontend old (3001)** → сравнение с `fe_migration` на **3000** через **`./start-dev-migration.sh`**.  
- **Мастер-план остаточной миграции:** **`Детальный план остаточной миграции hr_helper_fe.md`** (корень репо); сводка статуса по фазам — **`fe_migration/docs/DETAILED_PLAN_STATUS.md`**.  
- План переноса страниц и чек-листы: **`MIGRATION_PLAN.md`** (корень репо; фазы A–K, I, J; код живёт в `fe_migration/`).  
- **Очередь нерешённого** (приёмка фаза 14, хвосты): **`MIGRATION_PLAN_UPD.md`** (корень репо).  
- **Расхождения с эталоном 3001** (намеренные и найденные при приёмке): **`fe_migration/docs/MIGRATION_DIVERGENCES.md`**.  
- Отдельно зафиксирована **доработка UI профиля и оболочки** под новую платформу (**frontend :3000**): **`fe_migration/docs/UI_MIGRATION_PLAN.md`** (футер, FloatingActions, тема, соцсети, UserCard и т.д.).  
- В текущем цикле миграции из доработок **исключены**: `Sidebar`, `Header`, `Footer`, `FloatingActions` (у `FloatingActions` зафиксирован `left: 12px`).  
- **`src/router-adapter.tsx`** вместо `next/link` и `next/navigation`.

---

## Зачем этот документ

1. Зафиксировать, что **актуален только** `fe_migration` и его запуск.  
2. При переносе экрана в **fe_migration** — следовать **`MIGRATION_PLAN.md`** (корень репо) и мастер-плану **`Детальный план остаточной миграции hr_helper_fe.md`**.  
3. При поиске legacy-кода — `frontend old/app/`, `frontend old/components/`.

---

## Миграция и качество переноса

- Перенос legacy-страниц (3001 → 3000): **`MIGRATION_PLAN.md`** + статус фаз **`fe_migration/docs/DETAILED_PLAN_STATUS.md`**.  
- Нерешённое и отложенное: **`MIGRATION_PLAN_UPD.md`**.  
- UI-изменения и parity с **3000** по профилю/хедеру/футеру: **`fe_migration/docs/UI_MIGRATION_PLAN.md`**.  
- После переноса каждой страницы: сверка построчно (**I**), чек-лист (**J**), таблица учёта (**G**).
