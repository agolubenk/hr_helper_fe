# Сайдбар и меню: сверка с `frontend` (:3000)

**Актуально:** поведение пунктов, ссылки и заглушки маршрутов описаны в **`sidebar.md`**. Визуальная приёмка с :3000 **пропущена** (перенесена версия из нового фронта); маршруты проверены на уровне роутера.

**Задача плана:** п. 6.7 / 2.2 — меню как на целевом приложении, плюс визуальная приёмка.

## Результат `diff` конфигов (на дату правки)

Сравнение файлов:

- `frontend/src/shared/config/menuConfig.tsx` ↔ `fe_migration/src/config/menuConfig.tsx`
- `frontend/src/shared/config/settingsMenuConfig.tsx` ↔ `fe_migration/src/config/settingsMenuConfig.tsx`

По содержимому пункты меню, порядок и иконки **совпадают**; отличия только в путях импорта (эталон: `@/shared/components/icons/...`, миграция: `@/components/icons/...`) — это ожидаемо для Vite-дерева.

## Что сделать вручную

1. Запустить **frontend** на :3000 и **fe_migration** на :3002.
2. Пройти все группы сайдбара (основное меню, профиль, админка при наличии) и сверить подписи, порядок, отступы, активное состояние, мобильную ширину.
3. Новые намеренные отличия — вносить в `docs/MIGRATION_DIVERGENCES.md` (§9), а не «тихо» подгонять под :3001.

## Связанные файлы в миграции

- `src/config/menuConfig.tsx`
- `src/config/settingsMenuConfig.tsx`
- `src/config/profileRequestsConfig.ts`
- `src/components/Sidebar.tsx`
