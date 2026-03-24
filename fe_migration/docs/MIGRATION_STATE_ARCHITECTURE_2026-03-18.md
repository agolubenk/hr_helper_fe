# Состояние миграции, структура и архитектура (2026-03-18)

Документ фиксирует текущую картину перед переходом к фазе 15: что уже перенесено, как устроен проект, где есть отклонения от `frontend old`, и что осталось в доработке.

## 1) Текущее состояние (кратко)

- Миграция `frontend old (Next, 3001)` -> `fe_migration (Vite, 3002)` по маршрутам **фактически закрыта**: в `MIGRATION_PLAN.md` чеклист **H** отмечен `[x]` по legacy-страницам.
- Фазы с ключевым прогрессом:
  - **5.1** модалки вакансий: закрыто как точечный хвост.
  - **5.3** emoji в `components/vacancies/*`: закрыто.
  - **12** роли: frontend-часть закрыта (client-guard + матрица + API-first источник роли).
  - **13** API вместо моков: frontend-часть закрыта (service-wrapper'ы, API-switch, унифицированные коды ошибок + тесты).
- Смоук-приемка (фаза 14 мастер-плана) отдельно и сейчас не выполняется по решению команды.

## 2) Архитектура `fe_migration/src` (актуальная)

Корневые зоны:

- `app/` — роутинг, layouts, страницы, app-level API/конфиги.
- `components/` — UI-модули и доменные блоки (workflow, vacancies, wiki, profile и т.д.).
- `features/` — вынесенные фичи (сейчас ключевая: `features/ats`).
- `services/` — сервисные обёртки источников данных (фаза 13).
- `lib/` — утилиты, типы, локальные storage-помощники, API-хелперы.
- `config/`, `shared/` — общие конфиги/переиспользуемые части.

Ключевые файлы платформы:

- `src/app/App.tsx` — единая карта маршрутов.
- `src/router-adapter.tsx` — адаптер Next-подобной навигации поверх React Router.
- `src/lib/api.ts` — базовый слой API-запросов.

## 3) Полнота миграции с Next (проверка)

### Источник сверки

- legacy-источник: `frontend old/app/**/page.tsx`
- целевой роутинг: `fe_migration/src/app/App.tsx`
- контрольный чеклист: `MIGRATION_PLAN.md` -> часть **H**

### Итог

- Legacy-маршруты из `page.tsx` перенесены (чеклист H закрыт).
- Для части legacy-путей используются осознанные адаптации:
  - редиректы (`/finance` -> `/company-settings/finance`, `/admin-crm` -> `/admin`);
  - wildcard/route-shell для 404 и совместимости;
  - вложенные relative-routes в `/admin` и `/specializations`.
- Добавлены маршруты, которых не было в old (например `wiki-new`, placeholder-модули, расширения для текущего меню).

Вывод: миграция маршрутов выполнена, оставшиеся задачи — не «перенос page.tsx», а приёмка качества/контракты API/документация.

## 4) Осознанные отклонения от old

Источник: `docs/MIGRATION_DIVERGENCES.md`.

Главное:

- Vite + React Router вместо Next App Router.
- Изменения UI/UX в workflow, wiki, profile и ряде модулей.
- Моки как основной источник данных в ряде разделов (до фазы API).
- Глобальные исключения из доработок на текущем цикле:
  - `Sidebar`
  - `Header`
  - `Footer`
  - `FloatingActions` (позиция зафиксирована: `left: 12px`)

## 5) Что обновлено в недавних итерациях

### Фаза 12 (roles)

Реализовано:

- `src/app/admin/roles.ts` — типы ролей + матрица доступа.
- `src/app/admin/useRoleAccess.ts` — хук доступа.
- guard в `AdminLayoutShell` (`/errors/403` при запрете).
- фильтрация пунктов в `AdminSidebar` и `AdminPage`.
- отображение action-прав в `AdminUsersPage` / `AdminGroupsPage`.

Осталось:

- server-side/API enforcement (backend-контракты прав).

### Фаза 13 (mock -> api service layer)

Реализовано:

- `src/app/api/profile.ts`:
  - `fetchProfile()` с переключателем `VITE_USE_PROFILE_API`;
  - `saveProfile(...)`;
  - `saveProfileSocialLinks(...)`.
- `src/app/pages/ProfilePage.tsx` подключена к сохранению через сервисные функции с fallback.
- `src/services/profile/quickButtonsService.ts`.
- `src/services/profile/integrationsService.ts`.
- `src/components/profile/QuickButtonsPage.tsx` переведён на сервис-обёртку.
- `src/components/profile/IntegrationsPage.tsx` подключена к сервису статусов/настроек.
- `.env.example`: добавлен `VITE_USE_PROFILE_API=false`.

Осталось:

- финально согласовать backend endpoint-контракты (внешняя зависимость).

## 6) Статус фаз (на сейчас)

Опорный документ: `docs/DETAILED_PLAN_STATUS.md`.

- Фаза **12**: выполнено (frontend scope).
- Фаза **13**: выполнено (frontend scope).
- Фаза **14** (smoke): отложена (не запускаем сейчас).
- Фаза **15** (документирование): готова к активной фазе.

## 7) Рекомендация перед фазой 15

Перед заполнением карточек страниц:

1. Зафиксировать этот документ как baseline состояния.
2. Продолжить документирование в `docs/pages/INDEX.md` по приоритету:
   - `workflow`
   - `wiki` (view + edit)
   - `company-settings`
   - `ATS`
   - `profile`
3. Для каждой карточки ссылаться на:
   - `MIGRATION_DIVERGENCES.md` (если есть отличия),
   - `MOCK_SERVICES.md` (источник данных),
   - профильный `COMPONENTS_DOCUMENTATION.md`.
