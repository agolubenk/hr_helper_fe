# Единый слой моков (до API, фаза 13)

**Источник требований:** **`Детальный план остаточной миграции hr_helper_fe.md`** (корень репо) — **фаза 13**; статус — **`DETAILED_PLAN_STATUS.md`**; очередь — **`MIGRATION_PLAN_UPD.md`** (корень репо) §8.

**Цель:** мок-данные не размазывать по компонентам; при подключении бэкенда заменить вызовы в одном месте (или через тонкие обёртки), сохранить моки для тестов / Storybook / офлайн по решению команды.

---

## Принципы

| # | Правило |
|---|---------|
| 1 | Крупные массивы и генераторы — в отдельных файлах `*Mocks.ts`, `*mocks.ts` или в `mocks/` внутри фичи. |
| 2 | Страницы и UI-компоненты импортируют данные из моков/сервиса, а не дублируют объекты inline. |
| 3 | Для «почти API» — по возможности функции `getXxx()` / `fetchXxxMock()` с задержкой `setTimeout`, чтобы потом заменить на `apiRequest`. |
| 4 | **localStorage** (`quickButtonsStorage` и др.) — **fallback** после фазы 13, если API недоступен; поведение фиксируется в коде и в плане. |
| 5 | Новые фичи на моках — добавлять строку в таблицу ниже. |

---

## Реестр (актуализировать при добавлении модуля)

| Зона | Файл(ы) | Примечание |
|------|-----------|------------|
| Бенчмарки | `src/app/pages/benchmarks/benchmarksMocks.ts`, дашборд | Список `/finance/benchmarks/all` — в `BenchmarksPage` + те же моки |
| Финансы (общие) | `src/components/finance/*`, моки рядом с компонентами | По мере появления API — свести к одному клиенту |
| ATS | `src/features/ats/mocks.ts` | Оценки — заглушки до контракта |
| Профиль (до API) | `userMocks`, интеграции, quick buttons через `quickButtonsStorage` | Фаза 13 — замена на API |
| Прочее | Искать в репо: `mocks.ts`, `*Mocks.ts` | Дополнять таблицу |

---

## Целевая схема после контракта API

1. Один слой **`src/lib/api.ts`** (или разделение по доменам) — реальные запросы.  
2. Опционально **`src/services/`** — обёртки `getProfile()`, `getBenchmarks()` внутри: `if (useMocks) return mock; return api.get(...)`.  
3. Моки остаются импортируемыми модулями для тестов и dev-режима.

Детали контрактов — не в этом файле; здесь только **организация фронта**.

## Ближайший спринт (фаза 13)

- [x] Профиль: `fetchProfile` / `saveProfile` (mock→api switch через `VITE_USE_PROFILE_API`) в `src/app/api/profile.ts`.
- [x] Quick buttons: сервис-обёртка `src/services/profile/quickButtonsService.ts`, `localStorage` как fallback.
- [x] Соцсети: `saveProfileSocialLinks` в `src/app/api/profile.ts` + интеграция в `ProfilePage`.
- [x] Интеграции: сервис чтения статусов/настроек `src/services/profile/integrationsService.ts` + интеграция в `IntegrationsPage`.
- [x] Frontend-контракт ошибок профиля: `ProfileApiResult` + коды (`UNAUTHORIZED`/`FORBIDDEN`/`VALIDATION`/`NOT_FOUND`/`NETWORK`) в `src/app/api/profile.ts`.
- [ ] Финальное согласование backend endpoint'ов/кодов (внешняя зависимость, вне текущего FE-спринта).

---

*Обновляйте таблицу реестра при переносе новой фичи на моках.*
