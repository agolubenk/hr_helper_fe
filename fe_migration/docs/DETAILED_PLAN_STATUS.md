# Статус по «Детальному плану остаточной миграции hr_helper_fe.md»

**Документ-источник (единственный мастер-план):** **`Детальный план остаточной миграции hr_helper_fe.md`** (корень репозитория).  
Этот файл — **сводка статуса по фазам**; при закрытии фаз обновляйте таблицы здесь и при необходимости журнал внизу.

| Вспомогательные документы | Назначение |
|---------------------------|------------|
| **`MIGRATION_PLAN_UPD.md`** (корень репо) | Чеклисты smoke (§1–3), отложенное, очередь |
| **`fe_migration/docs/sidebar.md`** | Сайдбар: пункты, маршруты |
| **`fe_migration/docs/MIGRATION_CHECK_URLS.md`** | URL для smoke (фаза 14) |
| **`fe_migration/docs/MOCK_SERVICES.md`** | Единый слой моков до API (фаза 13) |
| **`fe_migration/docs/MIGRATION_STATE_ARCHITECTURE_2026-03-18.md`** | Зафиксированный baseline: текущее состояние, структура и полнота миграции до фазы 15 |

---

## Два параллельных направления (из мастер-плана)

| Направление | Содержание |
|-------------|------------|
| **Приёмка** | **Фаза 14** + **`MIGRATION_PLAN_UPD` §1–3** — smoke по **`MIGRATION_CHECK_URLS.md`**, порядок: **workflow → wiki → company-settings → ATS → профиль**, затем остальное; **`npm run build`** зелёный; консоль без необработанных ошибок. |
| **Разработка крупных блоков** | **8**, **12**, **13** — отдельными задачами; **6.2** (бенчмарки) **закрыт** на UI + моках; перед релизом всё равно нужен **smoke 14**. |

---

## Фаза 1 — Инфраструктура

| Пункт | Статус | Факт |
|-------|--------|------|
| **1.1** ENV `NEXT_PUBLIC_*` → `VITE_*` | Выполнено | В `fe_migration/src` нет `NEXT_PUBLIC_` / `process.env` для публичных ключей; `src/lib/api.ts` — `import.meta.env.VITE_API_URL` |
| **1.2** `document.title` | Выполнено | Основные маршруты: `AppLayout` (`pageTitle` → `«Раздел» — HR Helper`). Страницы **без** оболочки: `useDocumentTitle` — `/account/login`, forgot/reset password |
| **1.3** `router-adapter` | Ок | Экспорт: `usePathname`, `useRouter`, `useLocation`, `useNavigate`, `useParams`, `useSearchParams`, `Link`. Часть layout/страниц по-прежнему импортирует `react-router-dom` напрямую — допустимо |

---

## Фаза 2 — Верхний уровень

| Пункт | Статус | Комментарий |
|-------|--------|-------------|
| **2.1** FloatingActions | Исключено из плана | Заморожено; позиция панели `left: 12px`, `bottom: 60px` |
| **2.2** Sidebar / меню | Исключено из плана | Заморожено; изменений не планируется |
| **2.3–2.5** AppLayout, Header, ThemeProvider | Header — исключён; остальное по плану | Header заморожен, AppLayout/ThemeProvider без задач в этой итерации |
| **2.6** StatusBar | Выполнено | `diff -q`: `StatusBar.tsx` и `StatusBar.module.css` **идентичны** `frontend old/components/` |
| **2.7–2.8** FloatingLabelInput, QuickButtonsContext | Ок | По плану |

---

## Фаза 3 — Профиль

| Пункт | Статус | Комментарий |
|-------|--------|-------------|
| **3.1** AccentColorSettings | Выполнено (аудит) | 21 акцентный цвет Radix + `COLOR_PREVIEWS` совпадают с `frontend old/components/profile/AccentColorSettings.tsx`; логика через `ThemeProvider` |
| **3.2** ProfileEditForm | Намеренно иначе | Расписание и интервал встреч **не** в форме редактирования — вкладка «Расписание» (`ScheduleSettingsPage`). Зафиксировано в `MIGRATION_DIVERGENCES.md` §7 |
| **3.3** Интеграции | Выполнено (аудит списка) | Перечень карточек: `docs/INTEGRATIONS_PROFILE_PARITY.md` |
| **3.4** QuickButtonsPage | Выполнено | `storage` / `localStorageChange` по `QUICK_BUTTONS_KEY`; до API — см. фаза **13**, `MOCK_SERVICES.md` |
| **3.5–3.8** Остальное | Ок / новые страницы | По плану |

---

## Фазы 4–11

| Фаза | Статус |
|------|--------|
| **4** Идентичные SHA (aichat, finance, …) | Функциональная smoke-проверка |
| **5.1** Модалки вакансий | Закрыто как точечный хвост | `VACANCIES_MODALS_AUDIT.md`: `AddVacancyModal` идентичен, `VacancyEditModal` проверен по критичным блокам |
| **5.2** Фильтр по статистике | Реализовано (`VacanciesPage`) |
| **5.3** Эмодзи → иконки | Выполнено для `components/vacancies/*` | В `VacancyEditModal` заменён `⚠` на `ExclamationTriangleIcon`; прочие emoji вне vacancies — вне этой задачи |
| **6.1** Кнопка «Добавить бенчмарк** | Выполнено | `BenchmarksPage` |
| **6.2** Бенчмарки: графики, интервалы, список | **Выполнено (UI + моки)** | Дашборд: `BenchmarkChartsSection`, `BenchmarkFinanceSettingsCard`, `benchmarkChartUtils`. Список `/finance/benchmarks/all`: таблица, пагинация, просмотр/редактирование. Данные — моки; **API — фаза 13** |
| **7** Wiki / wiki-new | Вне полного паритета | `MIGRATION_DIVERGENCES.md` §11 |
| **8** company-settings | Ручная сверка командой | URL → `MIGRATION_CHECK_URLS.md`; расхождения → §9 DIVERGENCES |
| **9** ATS | UI в `features/ats/` | Моки в `mocks.ts`; API — фаза **13** |
| **10–11** Новое / Invites | Проверка маршрутов `/invites/*` | По плану |

---

## Фазы 12–15

| Фаза | Статус |
|------|--------|
| **12** Роли | Выполнено (frontend): матрица + клиентский guard + API-first роль из профиля (fallback localStorage); backend-права отдельно |
| **13** API вместо моков + единый слой моков | Выполнено (frontend): сервисы + API-switch + унифицированные коды ошибок + Vitest тесты |
| **14** Smoke / приёмка | `MIGRATION_CHECK_URLS.md` + зелёный build; порядок см. раздел «Два параллельных направления» |
| **15** Документирование | `PAGES_AND_COMPONENTS_DOCS.md`, `docs/pages/` — не блокирует релиз |

---

## Объёмные фичи (таблица из мастер-плана)

| Фича / раздел | Откуда смотреть | Что делаем в fe_migration | Фаза | Статус |
|---------------|-----------------|---------------------------|------|--------|
| Бенчмарки (6.2) | `frontend old/components/finance/`, экран бенчмарков, `/company-settings/finance` | Графики, интервалы, настройки сбора, согласование с настройками финансов (моки) | **6.2** | 🟢 Выполнено (моки); API — **13** |
| Настройки компании | `frontend old/components/company-settings/` | Автосверка каталога + **`COMPANY_SETTINGS_PHASE8.md`**; ручной проход URL, новые находки → **`§9`** | **8** | 🟡 Авточасть готова; smoke вручную |
| Роли | `docs/admin-roles.md` + продукт | Матрица роль → разделы/действия, клиентские ограничения UI; API — отдельно | **12** | 🟡 В процессе |
| API вместо моков | Контракт бэкенда | Профиль, quick buttons, соцсети, интеграции; единый слой — **`MOCK_SERVICES.md`**; `quickButtonsStorage` как fallback | **13** | 🟡 В процессе |
| Вакансии, модалки | Diff old ↔ `VacancyEditModal` / `AddVacancyModal` | Построчно при расхождениях; опора на **`VACANCIES_MODALS_AUDIT.md`** | **5.1** | 🟡 По запросу |
| Wiki / wiki-new | Решение в **`DIVERGENCES` §11** | Не «перенос 1:1», стабилизация маршрутов и доработки по ТЗ | **7** | По продукту |
| ATS | Эталон `frontend` `ai/ats`, не `frontend old` | UI уже в `features/ats/`; дальше — API по контракту | **9** + **13** | UI готов |

---

## Сводная таблица приоритетов (мастер-план)

| Пометка | Задача | Статус |
|---------|--------|--------|
| 🔴 P0 | ENV | ✅ |
| 🔴 P0 | ProfileEditForm «как old» | ⚠️ DIVERGENCES §7 |
| 🔴 P0 | build зелёный | Поддерживать |
| 🟢 P1 | Sidebar | Исключено из плана |
| 🔴 P1 | Модалки вакансий | Набор = old; diff — 5.1 |
| 🟡 P2 | document.title | ✅ |
| 🟡 P2 | Бенчмарки 6.1 / **6.2** | ✅ |
| 🟡 P2 | Вакансии 5.3 эмодзи | Частично |
| 🟡 P3 | QuickButtons storage | ✅ |
| 🟡 P3 | Роли, API профиля, единый слой моков | Очередь **12**, **13** |

---

## Журнал правок (фиксация в документах)

| Область | Файлы / суть |
|---------|----------------|
| **ATS** | См. предыдущие записи: опыт, версии, моки, табы — в `AtsCandidatePage`, `mocks.ts`, `ATS_MIGRATION_SCOPE.md` |
| **Бенчмарки — 6.2** | `BenchmarkChartsSection`, `BenchmarkFinanceSettingsCard`, `benchmarkChartUtils`, дашборд `/finance/benchmarks` |
| **Бенчмарки — список /all** | `BenchmarksPage`: моки, пагинация, таблица, просмотр/редактирование, `useMemo` без лишней загрузки |
| **Вакансии — 5.3** | `SalaryRanges*`, `TransferStages*`: `BarChartIcon` вместо 💰 |
| **Вакансии — 5.1/5.3 (2026-03-18)** | `VACANCIES_MODALS_AUDIT.md`: `AddVacancyModal` идентичен old, `VacancyEditModal` подтверждён по блокам; `VacancyEditModal.tsx`: `⚠` → `ExclamationTriangleIcon` |
| **Планы (март 2026)** | Мастер-план: **6.2** закрыт, **§13** расширен (единый слой моков), таблица объёмных фич + два параллельных направления; добавлен **`MOCK_SERVICES.md`** |
| **Фаза 8** | `COMPANY_SETTINGS_PHASE8.md`: `diff -rq` по `components/company-settings/` — 4 ожидаемых отличия; интеграции — упрощённый экран в `CompanySettingsPages.tsx` (**DIVERGENCES §12.2**) |
| **Исключения (2026-03-18)** | В мастер-план и UPD внесены жёсткие исключения: `Sidebar`, `Header`, `Footer`, `FloatingActions`; для `FloatingActions` в коде зафиксирован `left: 12px` |
| **Фаза 12 (2026-03-18)** | Добавлены `roles.ts` + `useRoleAccess.ts`; `AdminLayoutShell` с guard (`/errors/403`), фильтрация пунктов в `AdminSidebar` и `AdminPage`, отображение прав в `AdminUsersPage`/`AdminGroupsPage` |
| **Фаза 13 (2026-03-18)** | Добавлены profile API-switch (`VITE_USE_PROFILE_API`) и функции `saveProfile`/`saveProfileSocialLinks` в `app/api/profile.ts`; `ProfilePage` подключён к сервису сохранения; добавлены `services/profile/quickButtonsService.ts` и `services/profile/integrationsService.ts` |
| **Фазы 12/13 закрытие FE (2026-03-18)** | `useRoleAccess` получает роль из API профиля (fallback localStorage); `ProfilePage`/`profile.ts` переведены на `ProfileApiResult` с error-code mapping; добавлены Vitest-тесты для `quickButtonsStorage`, profile tabs и лимита соцсетей |
| **Док-срез перед фазой 15 (2026-03-18)** | Добавлен `MIGRATION_STATE_ARCHITECTURE_2026-03-18.md`: зафиксированы состояние migration, структура `src`, покрытие маршрутов относительно `frontend old`, и открытые хвосты фаз 12/13 |

---

*Последнее обновление: 2026-03-18 — frontend-фазы 12/13 закрыты (API-first role access, унифицированные API-ошибки профиля, Vitest тесты), без smoke-тестов.*

*Предыдущая запись: март 2026 — фаза 8: инвентаризация company-settings + §12 в DIVERGENCES.*
