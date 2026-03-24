# План переноса «frontend old» → «fe_migration»

**Цель:** всё отображается и ведёт себя как в старой версии. **Архитектуру FSD не вводим** — структура как сейчас: `src/components/`, `src/app/pages/`, общий `AppLayout` там, где он был в Next.

**Очередь нерешённого и отложенного** (приёмка, улучшения, роли, хвосты D/L/E) — в **`MIGRATION_PLAN_UPD.md`**.

**Мастер-план остаточной миграции** (фазы 1–15, объёмные фичи, приёмка): **`Детальный план остаточной миграции hr_helper_fe.md`** (корень репозитория). Статус по фазам — **`fe_migration/docs/DETAILED_PLAN_STATUS.md`**.

**Стек уже сменён:** Vite + React Router. Навигация через `@/router-adapter` (как Next: `Link href`, `useRouter().push`).

**Исключения (заморожено, не трогаем в рамках миграции):** `Sidebar`, `Header`, `Footer`, `FloatingActions` (для `FloatingActions` зафиксировано `left: 12px`).

---

## Часть A. Правила «обезьяньего» чек-листа (читать перед каждой страницей)

### A1. Один маршрут = один повторяемый цикл

Для **каждого** URL из старого приложения выполни **строго по порядку**:

| Шаг | Действие | Где смотреть в старом проекте |
|-----|----------|-------------------------------|
| 1 | Открой в браузере **старый** Next на **3001**, пройди по странице: клики, формы, модалки, скролл. Запиши отличия (если есть). | — |
| 2 | Найди файл страницы: `frontend old/app/<путь>/page.tsx`. | Путь URL ≈ путь папок (`/workflow` → `app/workflow/page.tsx`). |
| 3 | Скопируй **содержимое** страницы в новый файл: `fe_migration/src/app/pages/<ИмяПоПути>Page.tsx` (PascalCase, без `[ ]` в имени файла). | Пример: `VacanciesPage.tsx`, `WikiEditPage.tsx`. |
| 4 | Удали из копии строку `'use client'` (в Vite не нужна). | Вверху файла. |
| 5 | Замени импорты **Next** на адаптер, если ещё не заменены: `next/link` → `import { Link } from '@/router-adapter'`, `next/navigation` → `import { useRouter, usePathname, useParams } from '@/router-adapter'`. | Для `useSearchParams` — добавить в `router-adapter` обёртку над `useSearchParams` из `react-router-dom` при первом использовании. |
| 6 | Если страница оборачивалась в **свой** layout (не корневой): смотри `layout.tsx` в той же ветке папок. Либо вынеси обёртку в компонент и оберни **только** этот Route в `App.tsx`, либо вставь обёртку в начало JSX страницы — **как визуально в старом приложении**. | `app/admin/layout.tsx`, `app/specializations/layout.tsx`, `app/specializations/[id]/layout.tsx`. |
| 7 | Если страница использовала **AppLayout** в Next: в `App.tsx` оберни элемент маршрута в `<AppLayout pageTitle="..." userName="..." onLogout={...}>...</AppLayout>` — скопируй те же `pageTitle`/пропсы из старого `page.tsx`. | Старый файл часто: `<AppLayout pageTitle="...">...</AppLayout>`. |
| 8 | Если страница **без** AppLayout (логин, ошибки): в `App.tsx` **не** оборачивай в `AppLayout` — только `<Outlet>` или прямой компонент. | `account/login`, `errors/*`. |
| 9 | Добавь **Route** в `fe_migration/src/app/App.tsx`: путь = URL из Next (динамика: `:id` вместо `[id]`). | `/wiki/123` → `path="/wiki/:id"`. |
| 10 | Собери проект: `npm run build`. Исправь ошибки TypeScript. | — |
| 11 | Открой **тот же URL** на **3002**. Сравни с 3001: пиксели, поведение, консоль без красного. | — |
| 12 | Поставь галочку в таблице прогресса (ниже или свой трекер). | — |

### A2. Что **не** делать на этом этапе

- Не переносить файлы в `features/`, `entities/`, `shared/` по FSD.
- Не переименовывать бизнес-компоненты ради «красоты».
- Не менять URL (кроме явных редиректов из `next.config.js` — см. часть D).
- Не удалять CSS-модули и классы.

### A3. Именование файлов страниц (чтобы не путаться)

| URL (пример) | Файл страницы в fe_migration |
|--------------|------------------------------|
| `/` | уже есть `HomePage.tsx` |
| `/vacancies` | `VacanciesListPage.tsx` или `VacanciesPage.tsx` |
| `/vacancies/[id]` | `VacancyDetailPage.tsx` |
| `/wiki/[id]/edit` | `WikiEditPage.tsx` |
| `/ats/vacancy/:vacancyId/candidate/:candidateId` | `AtsCandidatePage.tsx` |

Главное — **один файл = один Route**, имя понятное человеку.

---

## Часть B. Фазы работ (этапы)

### Фаза 0 — Инфраструктура маршрутов (до переноса массы страниц)

**Цель:** любой новый маршрут добавляется по шаблону без хаоса.

1. **Редиректы из Next** — в `App.tsx` после `<Routes>` добавить дочерние маршруты или использовать `<Navigate replace to="..." />`:
   - `/finance` → `/company-settings/finance`
   - `/admin-crm` → `/admin`
   - `/admin-crm/*` → `/admin/*` (в React Router v6: отдельный Route с `path="admin-crm/*"` и редирект, либо дублирование вложенных путей — проще **добавить те же пути** что и в `/admin`).

2. **Страница 404** — перенести `app/errors/404/page.tsx` → маршрут `path="*"` в конце `Routes`.

3. **Вложенные layout’ы** — создать компоненты-обёртки:
   - `AdminLayoutShell.tsx` — содержимое из `app/admin/layout.tsx` (обернуть все `/admin/*` routes родительским Route с `element={<AdminLayoutShell><Outlet /></AdminLayoutShell>}`).
   - `SpecializationsLayoutShell.tsx` — из `app/specializations/layout.tsx`.
   - `SpecializationIdLayoutShell.tsx` — из `app/specializations/[id]/layout.tsx`.

4. **Документировать** в конце этого файла таблицу «старый layout → новый компонент-обёртка».

**Критерий готовности фазы 0:** редиректы работают; открыт несуществующий путь — видна та же 404, что на 3001.

---

### Фаза 1 — Аккаунт и пустой layout (без основного chrome)

**Порядок переноса (от простого к зависимым):**

1. `account/login/page.tsx`
2. `account/forgot-password/page.tsx`
3. `account/reset-password/page.tsx`
4. `account/profile/page.tsx` — обычно **с** AppLayout.

Для каждого пункта — цикл A1. Логин/пароль: **без** AppLayout, если так в старом.

**Профиль в fe_migration (доп. к эталону 3001):** часть экрана доведена под **новую платформу** `frontend/` (**3000**) — вкладки, тема, интеграции, футер, FloatingActions, соцсети. Полный перечень: **`docs/UI_MIGRATION_PLAN.md`**. Отличия от чистого копирования 3001: **UserCard** — без строки Telegram в карточке (ник в соцсетях ниже по странице); **заглушка аватара** — рамка + тень (как у загруженного фото).

---

### Фаза 2 — Страницы ошибок

Перенести в том порядке:

1. `errors/401`, `402`, `403`, `404`, `500`, `forbidden`

Часто без бокового меню — проверить визуально на 3001.

---

### Фаза 3 — Главный хаб и «линейные» разделы (один layout, без вложенных layout-деревьев)

**Статус:** перенесены все 7 маршрутов; билд проходит. Рекомендуется пройти по каждому URL на 3002 и сравнить с 3001.

| № | Путь | Файл в старом проекте | Готово |
|---|------|------------------------|--------|
| 1 | `/workflow` | `app/workflow/page.tsx` | ✓ |
| 2 | `/aichat` | `app/aichat/page.tsx` | ✓ |
| 3 | `/huntflow` | `app/huntflow/page.tsx` | ✓ |
| 4 | `/calendar` | `app/calendar/page.tsx` | ✓ |
| 5 | `/search` | `app/search/page.tsx` | ✓ |
| 6 | `/interviewers` | `app/interviewers/page.tsx` | ✓ |
| 7 | `/candidate-responses` | `app/candidate-responses/page.tsx` | ✓ |

**Внесённые изменения (в т.ч. внеплановые) по фазам 0–3:**

| Область | Что сделано |
|--------|-------------|
| **AppLayout** | Контейнер контента (Flex под хедером): фиксированная высота `calc(100vh - 64px - 49px)`, `overflow: hidden`, чтобы область не прокручивалась; внутренний Box — `overflow: auto`, скролл только у контента. |
| **Workflow** | Сайдбар (Вики, отчёты) сделан сворачиваемым; кнопка сворачивания/разворачивания в правой части шапки чата (иконка шеврона); состояние сайдбара сохраняется в `localStorage` (`workflowSidebarOpen`). |
| **Workflow** | Высота блока страницы: `workflowContainer` = `calc(100vh - 64px - 49px - 20px)`; чат и сайдбар заполняют доступное место без лишнего скролла. |
| **Workflow (чат)** | В блоке «Отказать кандидату?» добавлены два варианта отказа: кнопки «По офису» и «По финансам» (плюс «Нет» — не отказывать). Красная кнопка «Отменить отказ» под действиями — убрана по запросу. |
| **Workflow (header)** | Панель настроек интервью (Онлайн/Офис, офисы, чекбоксы интервьюеров): при нехватке ширины — горизонтальный скролл (`overflow-x: auto`, внутренний Flex с `flex-wrap: nowrap`). Клик по подписи чекбокса (имя интервьюера) переключает чекбокс. |
| **Candidate-responses** | Стили страницы приведены к общим: отступы контейнера (24px 28px 32px 28px), цвета вкладок и контента через переменные темы (`--color-background`, `--accent-11`, `--gray-11` и т.д.). |
| **Фаза 4** | Вакансии и зарплатные вилки: перенесены `VacanciesPage`, `SalaryRangesPage`; редиректы `VacancyDetailRedirect`, `VacancyEditRedirect`, `SalaryRangeDetailRedirect`; маршруты в `App.tsx`; стили в `pages/styles/`; `useSearchParams` через деструктуризацию `[searchParams]` (React Router). |
| **Фаза 5** | Заявки и инвайты: перенесены `HiringRequestsPage`, `InvitesPage`; редиректы `InviteDetailRedirect`, `InviteEditRedirect`; маршруты `/hiring-requests`, `/invites`, `/invites/:id`, `/invites/:id/edit`; стили `HiringRequestsPage.module.css`, `InvitesPage.module.css`; инвайты на моках, удаление/копирование текста через локальное состояние и мок. |
| **Вики (Фаза 7) — форма редактирования** | Убран верхний селект «Шаблон страницы»; выбор шаблонов только через кнопку «Добавить шаблон» в тулбаре и модалку. Три карточки на всю ширину контента: Содержание, Параметры (порядок, опубликовано, примечание), Действия (Удалить слева \| Отмена, Сохранить справа). |
| **Вики — справка на мобильных** | На ширине ≤768px блок «Справка» в сайдбаре скрыт; в шапке формы справа от заголовка — круглая кнопка с иконкой Info, по нажатию открывается модальное окно с тем же текстом справки (Markdown, рекомендации). |
| **Вики — плавающие кнопки** | Над футером справа: круглые кнопки «Отмена» и «Сохранить» (40 px), пока карточка с кнопками не в зоне видимости. Позиция привязана к контейнеру контента `[data-app-layout-content]` (ResizeObserver) — при открытии меню кнопки смещаются вместе с контентом. При прокрутке к карточке кнопки визуально расширяются до полноразмерных (IntersectionObserver, `--expansion`). Статические кнопки в карточке скрыты, пока видна плавающая панель (нет двойного контура). Фон панели полупрозрачный (color-mix с цветами темы), без лишних отступов у иконок в режиме «только иконка». |
| **Вики — прокрутка** | В `globals.css`: body и #root без прокрутки (`height: 100%`, `overflow: hidden`); прокручивается только область контента (`[data-app-layout-content]` с `overflow: auto` в AppLayout). |
| **Вики — документация** | Подробное описание и changelog формы редактирования: `src/components/wiki/COMPONENTS_DOCUMENTATION.md`. Краткая сводка: `docs/UI_MIGRATION_PLAN.md` (раздел «Форма редактирования вики»). |
| **Вики — плавающие кнопки (компонент)** | Вынесены в `FloatingConfirmActions` (название без привязки к вики): красная «Удалить», капсула «Отмена»/«Сохранить», анимация по `--expansion`. Подробности: `COMPONENTS_DOCUMENTATION.md` (п. 13). |
| **Вики — мобильный режим по ширине блока** | Расчёт «мобильная версия или нет» определяется **шириной блока** карточки действий (ResizeObserver по ref), порог 800px; не по viewport. При узком блоке карточка скрывается, панель всегда видна; при скрытой карточке кнопки всегда в компактном виде (только иконки). |
| **Вики — удаление через тост** | Подтверждение удаления страницы — тост с кнопками «Отмена»/«Удалить» (useToast.showWarning), без Popover. |
| **Фаза 8** | Отчётность: перенесены ReportingPage, CompanyReportPage, HiringPlanPage, YearlyHiringPlanPage; маршруты /reporting, /reporting/company, /reporting/hiring-plan, /reporting/hiring-plan/yearly; стили в pages/styles/. |
| **Фаза 10** | Проекты: ProjectsPage, ProjectDetailPage, ProjectsTeamsPage, ProjectsResourcesPage; моки `projectsMocks.ts`; стили `ProjectsPage.module.css`; маршруты `/projects`, `/projects/:id`, `/projects/teams`, `/projects/resources`; динамический `pageTitle` для карточки проекта через `ProjectDetailAppLayout` в `App.tsx`. |
| **Фаза 14** | ATS: `AtsIndexPage`, `AtsCandidatePage`, assessment new/view/edit; моки `atsMocks.ts`; маршруты в `App.tsx` (порядок: специфичные assessment перед кандидатом). |
| **Фаза 15** | Финальная приёмка: smoke по `docs/MIGRATION_CHECK_URLS.md`, части F–J плана; при необходимости — `.env.example` (`VITE_API_URL`), построчный аудит I для критичных страниц. |

**Следующий этап:** Фаза 15 — финальная приёмка (см. ниже и `docs/MIGRATION_CHECK_URLS.md`).

---

### Фаза 4 — Вакансии и зарплатные вилки

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/vacancies` | `app/vacancies/page.tsx` | ✓ |
| 2 | `/vacancies/[id]` | `app/vacancies/[id]/page.tsx` | ✓ (редирект) |
| 3 | `/vacancies/[id]/edit` | `app/vacancies/[id]/edit/page.tsx` | ✓ (редирект) |
| 4 | `/vacancies/salary-ranges` | `app/vacancies/salary-ranges/page.tsx` | ✓ |
| 5 | `/vacancies/salary-ranges/[id]` | `app/vacancies/salary-ranges/[id]/page.tsx` | ✓ (редирект) |

Динамика в Router: `:id` → в компоненте `useParams().id`.

---

### Фаза 5 — Заявки, инвайты

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/hiring-requests` | `app/hiring-requests/page.tsx` | ✓ |
| 2 | `/invites` | `app/invites/page.tsx` | ✓ |
| 3 | `/invites/[id]` | `app/invites/[id]/page.tsx` | ✓ (редирект) |
| 4 | `/invites/[id]/edit` | `app/invites/[id]/edit/page.tsx` | ✓ (редирект) |

Примечание: `hiring-requests/[id]` и `hiring-requests/[id]/edit` в старом репо страниц не имели — ссылки ведут на маршруты; при необходимости добавить позже.

---

### Фаза 6 — Финансы (и редирект /finance)

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/company-settings/finance` | `app/company-settings/finance/page.tsx` | ✓ |
| 2 | `/finance/benchmarks` | `app/finance/benchmarks/page.tsx` | ✓ |
| 3 | Редирект `/finance` → `/company-settings/finance` | фаза 0 | ✓ |

---

### Фаза 7 — Вики

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/wiki` | `app/wiki/page.tsx` | ✓ |
| 2 | `/wiki/[id]` | `app/wiki/[id]/page.tsx` | ✓ |
| 3 | `/wiki/[id]/edit` | `app/wiki/[id]/edit/page.tsx` | ✓ |

**Доп. изменения по форме редактирования (WikiEditForm):** см. таблицу «Внесённые изменения» выше (строки «Вики (Фаза 7) — форма редактирования», «Вики — справка на мобильных», «Вики — плавающие кнопки», «Вики — прокрутка», «Вики — документация»). Подробно: `src/components/wiki/COMPONENTS_DOCUMENTATION.md`, кратко: `docs/UI_MIGRATION_PLAN.md`.

---

### Фаза 8 — Отчётность

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/reporting` | `app/reporting/page.tsx` | ✓ |
| 2 | `/reporting/company` | `app/reporting/company/page.tsx` | ✓ |
| 3 | `/reporting/hiring-plan` | `app/reporting/hiring-plan/page.tsx` | ✓ |
| 4 | `/reporting/hiring-plan/yearly` | `app/reporting/hiring-plan/yearly/page.tsx` | ✓ |

Перенесены: `ReportingPage`, `CompanyReportPage`, `HiringPlanPage`, `YearlyHiringPlanPage`; стили в `pages/styles/`; маршруты в `App.tsx`. Навигация через `useRouter`/`Link` из `@/router-adapter`. Моки на месте.

---

### Фаза 9 — Telegram

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/telegram` | `app/telegram/page.tsx` | ✓ |
| 2 | `/telegram/2fa` | `app/telegram/2fa/page.tsx` | ✓ |
| 3 | `/telegram/chats` | `app/telegram/chats/page.tsx` | ✓ (mock-версия) |

Перенесены: TelegramPage, Telegram2FAPage, TelegramChatsPage; подключены маршруты в `src/app/App.tsx`. Для `чата` использована упрощённая mock-реализация (без DnD/модалок), но с отображением сообщений через `FormattedText` и вводом через `RichTextInput`.

---

### Фаза 10 — Проекты

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/projects` | `app/projects/page.tsx` | ✓ |
| 2 | `/projects/[id]` | `app/projects/[id]/page.tsx` | ✓ |
| 3 | `/projects/teams` | `app/projects/teams/page.tsx` | ✓ |
| 4 | `/projects/resources` | `app/projects/resources/page.tsx` | ✓ |

Перенесены: `ProjectsPage`, `ProjectDetailPage`, `ProjectsTeamsPage`, `ProjectsResourcesPage`; моки в `pages/projectsMocks.ts`; стили `pages/styles/ProjectsPage.module.css`; маршруты в `App.tsx`. Для `/projects/:id` заголовок шапки задаётся обёрткой `ProjectDetailAppLayout` (имя проекта или «Проект»). Навигация через `useRouter` из `@/router-adapter`. Порядок маршрутов: `/projects/teams` и `/projects/resources` **выше** `/projects/:id`, чтобы не перехватывались как id.

---

### Фаза 11 — Специализации (вложенный layout)

| № | Путь | Файл | Статус |
|---|------|------|--------|
| 1 | `/specializations` | `app/specializations/page.tsx` | ✓ |
| 2 | `/specializations/:id` | `app/specializations/[id]/page.tsx` | ✓ (редирект на `info`) |
| 3 | `/specializations/:id/info` | `app/specializations/[id]/info/page.tsx` | ✓ |
| 4 | `/specializations/:id/grades` | `app/specializations/[id]/grades/page.tsx` | ✓ |
| 5 | `/specializations/:id/matrix` | `app/specializations/[id]/matrix/page.tsx` | ✓ |
| 6 | `/specializations/:id/career` | `app/specializations/[id]/career/page.tsx` | ✓ |
| 7 | `/specializations/:id/vacancies` | `app/specializations/[id]/vacancies/page.tsx` | ✓ |
| 8 | `/specializations/:id/allocation` | `app/specializations/[id]/allocation/page.tsx` | ✓ |
| 9 | `/specializations/:id/preview` | `app/specializations/[id]/preview/page.tsx` | ✓ |

Перенесены layout-обёртки `SpecializationsLayoutShell` и `SpecializationIdLayoutShell`, подключены `SpecializationsProvider`, `TreeSidebar`, `PreviewSidebar`, стили `SpecializationsPage.module.css`, маршруты вкладок в `App.tsx`.

---

### Фаза 12 — Настройки компании

Промежуточный результат:

| № | Путь | Статус |
|---|------|--------|
| 1 | `/company-settings` | ✓ |
| 2 | `/company-settings/grades` | ✓ |
| 3 | `/company-settings/rating-scales` | ✓ |
| 4 | `/company-settings/employee-lifecycle` | ✓ |
| 5 | `/company-settings/finance` | ✓ (было ранее) |
| 6 | `/company-settings/candidate-fields` | ✓ |
| 7 | `/company-settings/scorecard` | ✓ |
| 8 | `/company-settings/sla` | ✓ |
| 9 | `/company-settings/vacancy-prompt` | ✓ |
| 10 | `/company-settings/recruiting/stages` | ✓ |
| 11 | `/company-settings/recruiting/commands` | ✓ |
| 12 | `/company-settings/recruiting` | ✓ (редирект на rules) |
| 13 | `/company-settings/org-structure` | ✓ |
| 14 | `/company-settings/integrations` | ✓ |
| 15 | `/company-settings/user-groups` | ✓ |
| 16 | `/company-settings/users` | ✓ |
| 17 | `/company-settings/recruiting/rules` | ✓ |
| 18 | `/company-settings/recruiting/offer-template` | ✓ |

**Список типичных путей:** `org-structure`, `grades`, `rating-scales`, `employee-lifecycle`, `integrations`, `user-groups`, `users`, `candidate-fields`, `scorecard`, `sla`, `vacancy-prompt`, `recruiting/stages`, `recruiting/rules`, `recruiting/commands`, `recruiting/offer-template`.

Порядок: **сначала** страницы без тяжёлых модалок, **потом** сложные — чтобы раньше поймать общие баги импорта.

---

### Фаза 13 — Админка

1. Route `path="/admin"` с **AdminLayoutShell** из `app/admin/layout.tsx`.
2. Дочерние: `/admin`, `/admin/users`, `/admin/groups` (и любые другие из `app/admin/**/page.tsx`).

Статус: ✓ Выполнено (перенесены `AdminPage`, `AdminUsersPage`, `AdminGroupsPage`; маршруты подключены в `App.tsx`; сохранены редиректы `/admin-crm` -> `/admin`).

---

### Фаза 14 — ATS

| № | Путь | Файл |
|---|------|------|
| 1 | `/ats` | `app/ats/page.tsx` | ✓ |
| 2 | `/ats/vacancy/:vacancyId/candidate/:candidateId` | nested `page.tsx` | ✓ |
| 3 | assessment new / view / edit | соответствующие `page.tsx` | ✓ |

Параметры: `useParams()` → `vacancyId`, `candidateId`, `assessmentId`.

Статус: ✓ Выполнено (маршруты в `App.tsx`, страницы `AtsIndexPage`, `AtsCandidatePage`, `AtsAssessmentNewPage`, `AtsAssessmentViewPage`, `AtsAssessmentEditPage`, моки `atsMocks.ts`).

---

### Фаза 15 — Финальная приёмка (в этом файле)

> **Согласование с мастер-планом:** в **`Детальный план остаточной миграции hr_helper_fe.md`** **smoke и build** отнесены к **фазе 14**, а **фаза 15** там — **документирование** страниц (`fe_migration/docs/PAGES_AND_COMPONENTS_DOCS.md`). Ниже — единый чеклист «закрыть миграцию по качеству»; детальный чеклист smoke — **`MIGRATION_PLAN_UPD.md` §1–3** и **`fe_migration/docs/DETAILED_PLAN_STATUS.md`**.

**Цель:** убедиться, что все основные URL открываются на 3002 без неожиданных поломок; расхождения с **3001** при этом **не скрывать и не «лечить» без задачи** — только фиксировать.

1. Пройти **часть F** (Sidebar / smoke / build).
2. Использовать **`fe_migration/docs/MIGRATION_CHECK_URLS.md`** как единый список ссылок для ручной проверки (порт по умолчанию 3002).
3. Все **намеренные и обнаруженные отличия** от эталона — в **`fe_migration/docs/MIGRATION_DIVERGENCES.md`** (раздел §9 — журнал при приёмке). **Не откатывать** изменения, уже описанные там или в `fe_migration/docs/UI_MIGRATION_PLAN.md` / таблице «Внесённые изменения» выше.
4. По приоритету: **часть J** для ключевых разделов; **часть I** — для страниц с тяжёлой логикой (вики, workflow, company-settings).
5. Проверить **`VITE_*`**: образец в **`fe_migration/.env.example`** (см. `fe_migration/src/lib/api.ts`).

**Критерий готовности:** все пункты чеклиста H, относящиеся к перенесённым маршрутам, отмечены `[x]`; smoke-лист пройден или зафиксированы известные отличия в **`fe_migration/docs/MIGRATION_DIVERGENCES.md`** (и при необходимости в заметках к части G).

---

## Часть C. Стили, вёрстка, статика

### C1. CSS-модули рядом со страницей

- Если у страницы в Next был `page.module.css` или `something.module.css` в той же папке — **скопируй файл** в `fe_migration/src/app/pages/styles/` с уникальным именем, например `WorkflowPage.module.css`, и обнови импорт в перенесённой странице.

### C2. Глобальные стили страницы

- Если страница импортировала `./xyz.css` (не module) — положи рядом с страницей или в `src/app/styles/` и импортируй из нового `*Page.tsx`.

### C3. Статика `public/`

- Уже скопирована. Если на новой странице появляются **новые** пути к картинкам из старого `public/` — скопируй недостающие файлы из `frontend old/public` в `fe_migration/public` **с тем же относительным путём** (`/img/...`, `/avatars/...`).

### C4. Шрифты

- Если в Next `layout.tsx` подключали шрифты через `next/font` — в Vite: подключить те же шрифты через `<link>` в `index.html` или `@import` в `globals.css`, чтобы метрики совпадали.

---

## Часть D. Логика и данные

### D1. Переменные окружения

- Везде заменить `process.env.NEXT_PUBLIC_*` на `import.meta.env.VITE_*` и добавить в `.env.example` в корне `fe_migration`.
- Пример: `NEXT_PUBLIC_API_URL` → `VITE_API_URL`.

### D2. Серверные компоненты

- В Next могли быть **server components** без `'use client'`. В Vite всё клиентское: если страница делала `fetch` на сервере — перенести `fetch` в `useEffect` или оставить в обработчике; при необходимости обернуть в React Query позже (**пока не обязательно** — главное тот же результат).

### D3. `metadata` из layout

- Заголовок вкладки: в переносимой странице вызвать `useEffect(() => { document.title = '...' }, [])` с тем же title, что был в `export const metadata`.

### D4. Импорты из `@/app/...`

- Любой импорт вида `@/app/foo/page` заменить: либо вынести типы/константы в `@/app/types/foo.ts`, либо импортировать из нового `*Page.tsx` (избегать циклов — типы в отдельный `.ts`).

---

## Часть E. Расширение `router-adapter` по мере надобности

Когда страница падает из-за отсутствующего API Next:

| Next | Добавить в `router-adapter.tsx` |
|------|----------------------------------|
| `useSearchParams()` | `export { useSearchParams } from 'react-router-dom'` |
| `redirect()` | не используется в клиенте; заменить на `<Navigate>` или `navigate()` |
| `notFound()` | `navigate('/errors/404')` или рендер 404-компонента |

---

## Часть F. Финальная приёмка

1. Пройти **все** пункты Sidebar на 3001 — составить список URL.
2. Каждый URL открыть на 3002 — галочка.
3. Смоук-тест: логин (если есть) → главная → 3–5 случайных разделов → выход.
4. Консоль: нет необработанных ошибок при типичных действиях.
5. `npm run build` без ошибок.

---

## Часть G. Таблица учёта (скопировать в трекер)

Колонки: **Путь** | **Перенесено** | **Сверены строки (I)** | **Импорты (I2)** | **J1–J5 ОК** | **Build ОК** | **Заметки**.

Заполнять **после полного цикла K** по странице.

---

## Часть H. Полный перечень `page.tsx` в старом приложении (чеклист)

Отметь каждую строку после переноса:

- [x] `app/page.tsx` — уже в fe_migration как HomePage  
- [x] `app/workflow/page.tsx`  
- [x] `app/aichat/page.tsx`  
- [x] `app/huntflow/page.tsx`  
- [x] `app/calendar/page.tsx`  
- [x] `app/search/page.tsx`  
- [x] `app/interviewers/page.tsx`  
- [x] `app/candidate-responses/page.tsx`  
- [x] `app/vacancies/page.tsx`  
- [x] `app/vacancies/[id]/page.tsx`  
- [x] `app/vacancies/[id]/edit/page.tsx`  
- [x] `app/vacancies/salary-ranges/page.tsx`  
- [x] `app/vacancies/salary-ranges/[id]/page.tsx`  
- [x] `app/hiring-requests/page.tsx`  
- [x] `app/invites/page.tsx`  
- [x] `app/invites/[id]/page.tsx`  
- [x] `app/invites/[id]/edit/page.tsx`  
- [x] `app/finance/page.tsx` (редирект → `/company-settings/finance`)  
- [x] `app/finance/benchmarks/page.tsx`  
- [x] `app/reporting/page.tsx`  
- [x] `app/reporting/company/page.tsx`  
- [x] `app/reporting/hiring-plan/page.tsx`  
- [x] `app/reporting/hiring-plan/yearly/page.tsx`  
- [x] `app/wiki/page.tsx`  
- [x] `app/wiki/[id]/page.tsx`  
- [x] `app/wiki/[id]/edit/page.tsx`  
- [x] `app/telegram/page.tsx`  
- [x] `app/telegram/2fa/page.tsx`  
- [x] `app/telegram/chats/page.tsx`  
- [x] `app/projects/page.tsx`  
- [x] `app/projects/[id]/page.tsx`  
- [x] `app/projects/teams/page.tsx`  
- [x] `app/projects/resources/page.tsx`  
- [x] `app/specializations/page.tsx`  
- [x] `app/specializations/[id]/page.tsx`  
- [x] `app/specializations/[id]/info/page.tsx`  
- [x] `app/specializations/[id]/matrix/page.tsx`  
- [x] `app/specializations/[id]/career/page.tsx`  
- [x] `app/specializations/[id]/allocation/page.tsx`  
- [x] `app/specializations/[id]/grades/page.tsx`  
- [x] `app/specializations/[id]/preview/page.tsx`  
- [x] `app/specializations/[id]/vacancies/page.tsx`  
- [x] `app/company-settings/page.tsx`
- [x] `app/company-settings/org-structure/page.tsx`
- [x] `app/company-settings/grades/page.tsx`
- [x] `app/company-settings/rating-scales/page.tsx`
- [x] `app/company-settings/employee-lifecycle/page.tsx`
- [x] `app/company-settings/integrations/page.tsx`
- [x] `app/company-settings/user-groups/page.tsx`
- [x] `app/company-settings/users/page.tsx`
- [x] `app/company-settings/finance/page.tsx`
- [x] `app/company-settings/candidate-fields/page.tsx`
- [x] `app/company-settings/scorecard/page.tsx`
- [x] `app/company-settings/sla/page.tsx`
- [x] `app/company-settings/vacancy-prompt/page.tsx`
- [x] `app/company-settings/recruiting/stages/page.tsx`
- [x] `app/company-settings/recruiting/rules/page.tsx`
- [x] `app/company-settings/recruiting/commands/page.tsx`
- [x] `app/company-settings/recruiting/offer-template/page.tsx`
- [x] `app/admin/page.tsx`  
- [x] `app/admin/users/page.tsx`  
- [x] `app/admin/groups/page.tsx`  
- [x] `app/account/login/page.tsx`  
- [x] `app/account/forgot-password/page.tsx`  
- [x] `app/account/reset-password/page.tsx`  
- [x] `app/account/profile/page.tsx`  
- [x] `app/errors/401/page.tsx`  
- [x] `app/errors/402/page.tsx`  
- [x] `app/errors/403/page.tsx`  
- [x] `app/errors/404/page.tsx`  
- [x] `app/errors/500/page.tsx`  
- [x] `app/errors/forbidden/page.tsx`  
- [x] `app/ats/page.tsx`  
- [x] `app/ats/vacancy/[vacancyId]/candidate/[candidateId]/page.tsx`  
- [x] `app/ats/.../assessment/new/page.tsx`  
- [x] `app/ats/.../assessment/[assessmentId]/page.tsx`  
- [x] `app/ats/.../assessment/[assessmentId]/edit/page.tsx`  

Если в репозитории появятся новые `page.tsx` — дописать в конец списка по тому же циклу A1.

---

## Часть I. Постраничный перенос: проверка **каждой строки** кода страницы

После копирования `page.tsx` в `*Page.tsx` для **данного маршрута** выполни **построчный аудит** (можно чанками по 50 строк).

### I1. Чек-лист по файлу страницы (`*Page.tsx`)

| # | Проверка | Действие при несоответствии |
|---|----------|-----------------------------|
| 1 | Каждый **import**: путь существует в `fe_migration`; нет `next/`, кроме уже заменённого. | Исправить импорт или добавить файл/экспорт в адаптер. |
| 2 | Каждый **хук** (`useState`, `useEffect`, `useMemo`, кастомные): зависимости и условия совпадают со старым файлом построчно. | Дифф построчно с `frontend old/.../page.tsx`. |
| 3 | Каждый **обработчик** (`onClick`, `onSubmit`, …): те же вызовы API, `toast`, `router.push`, `setState`. | Сверить с эталоном на 3001. |
| 4 | Каждый **условный рендер** (`&&`, тернарник): те же ветки. | |
| 5 | Каждый **ключ** в `.map()`: стабильный, как в старом файле. | |
| 6 | **Нет** мёртвого кода, случайно закомментированного при копировании. | |
| 7 | **Типы** пропсов дочерних компонентов: если страница передаёт пропсы — имена и смысл совпадают. | |

### I2. Чек-лист по цепочке импортов страницы

Рекурсивно (вручную или списком) для **каждого** импортируемого из страницы модуля:

1. Открыть файл в `fe_migration/src/components/` или `lib/`.
2. Убедиться, что в нём **нет** оставшихся `next/link`, `next/navigation`, `next/image`, `next/head` без замены.
3. Если компонент тянет **другую страницу** через `@/app/.../page` — вынести общие типы/константы в `.ts`, как в части D4.

### I3. Фиксация результата

В таблице учёта (часть G) для строки страницы добавить колонку **«Строки страницы сверены (да/нет)»** и **«Импорты страницы проверены (да/нет)»**.

---

## Часть J. Проверка функциональности страницы **в целом** (полное функционирование)

Для **каждого** перенесённого URL на **3002** (миграция) при открытом **3001** (эталон) — один и тот же сценарий.

### J1. Визуальное совпадение

- [ ] Первая отрисовка: **нет** «белого экрана», **нет** смещения layout относительно 3001 (ширина контента, отступы, header/sidebar).
- [ ] **Тёмная/светлая тема** — переключить на обоих портах, сравнить.
- [ ] **Мобильная ширина** (DevTools 375px): меню, скролл, нет горизонтального overflow там, где его нет на 3001.

### J2. Навигация с этой страницы

- [ ] Все **внутренние ссылки** (`Link`, кнопки с `router.push`) ведут на существующие в миграции маршруты или на корректный 404.
- [ ] **Назад/вперёд** браузера: состояние не ломается (особенно формы и модалки).

### J3. Интерактив (пройти все элементы на странице)

Для **каждой** кнопки, поля ввода, переключателя, таба, раскрывающегося блока:

| Элемент | На 3001 | На 3002 | Одинаково? |
|---------|---------|---------|------------|
| … | поведение | поведение | да/нет |

Минимум: клик → ожидаемый UI/API-вызов (в Network при наличии backend) или то же сообщение `toast`, что на 3001.

### J4. Данные и граничные случаи

- [ ] **Пустые списки** / **нет данных** — те же заглушки, что на 3001.
- [ ] **Длинный текст** / **много строк** — без поломки вёрстки.
- [ ] **Динамический маршрут**: несколько разных `id` из моков или тестовых URL — страница не падает.

### J5. Консоль и сеть

- [ ] **Console**: нет красных ошибок при загрузке и при типичных действиях.
- [ ] **Network**: те же запросы к `/api` (метод, путь), что на 3001 для тех же действий; статусы не хуже эталона.

### J6. Критерий «страница перенесена полностью»

Страница считается **готовой** только если:

1. Часть **I** выполнена (страница + импорты проверены).
2. Часть **J** — все подпункты J1–J5 отмечены.
3. `npm run build` в `fe_migration` проходит после изменений.

---

## Часть K. Порядок работы «одна страница — полный цикл»

Сводка для одного маршрута:

1. **A1** (цикл переноса) → 2. **I** (строки + импорты) → 3. **J** (функциональность) → 4. Галочка в **H** и таблице **G**.

Запрещено переходить к следующей странице из плана фаз **B**, пока текущая не прошла **K целиком**.

---

## Таблица: старый layout → новый компонент-обёртка (фаза 0)

| Старый layout (Next) | Новый компонент в fe_migration |
|----------------------|-------------------------------|
| `app/admin/layout.tsx` | `app/layouts/AdminLayoutShell.tsx` (+ `app/admin/AdminSidebar.tsx`, `app/admin/config.ts`, `app/admin/admin.module.css`) |
| `app/specializations/layout.tsx` | `app/layouts/SpecializationsLayoutShell.tsx` (заглушка; в фазе 11 — SpecializationsProvider, TreeSidebar) |
| `app/specializations/[id]/layout.tsx` | `app/layouts/SpecializationIdLayoutShell.tsx` (табы по URL + Outlet; в фазе 11 — useSpecializations, контент) |

---

## Заметки по документации (стек и UI)

| Документ | Назначение |
|----------|------------|
| **`Детальный план остаточной миграции hr_helper_fe.md`** (корень репо) | **Мастер-план** остатка: фазы 1–15, объёмные фичи, приоритеты P0–P4, правила расхождений. |
| **`fe_migration/docs/DETAILED_PLAN_STATUS.md`** | Сводка **статуса по фазам** мастер-плана (обновлять при закрытии работ). |
| **`MIGRATION_PLAN.md`** (этот файл) | Методология переноса **frontend old → fe_migration** (3001 ↔ 3002), фазы B–K внутри файла, чеклист H, части I–J. |
| **`MIGRATION_PLAN_UPD.md`** (корень репо) | Журнал: smoke (§1 ≈ **фаза 14** мастер-плана), I/J/G, хвосты D/L/E, улучшения, роли, DIVERGENCES, ATS. |
| **`fe_migration/docs/MIGRATION_CHECK_URLS.md`** | URL для smoke на **3002**. |
| **`fe_migration/docs/MIGRATION_DIVERGENCES.md`** | Намеренные и найденные отличия от 3001; журнал §9. |
| **`fe_migration/docs/MOCK_SERVICES.md`** | Единый слой моков до API (**фаза 13** мастер-плана). |
| **`fe_migration/docs/PAGES_AND_COMPONENTS_DOCS.md`** | Документирование страниц (**фаза 15** мастер-плана). |
| **`fe_migration/docs/UI_MIGRATION_PLAN.md`** | Сводка UI по **frontend :3000** (профиль, футер, FloatingActions и т.д.). |
| **`FRONTENDS_STACK_AND_STRUCTURE.md`** (корень репо) | Три приложения, порты, скрипты; навигация по всем планам. |
| **`fe_migration/src/components/logo/LOGO_README.md`** | **Обязательное правило:** логотип-робот — единый источник. Все места отображают лого только через `import { LogoRobot } from '@/components/logo'`. Не дублировать SVG, не создавать альтернативные компоненты логотипа. Улучшения лого — только в `LogoRobot.tsx` / `logoColors.ts`. |

*Документ живой: дополняй раздел «Заметки» и таблицу учёта по ходу работ.*

---

## Часть L. Документирование UI и логики (после переноса)

**Когда выполнять:** после завершения переноса страниц по фазам B (или параллельно, но не в ущерб переносу). Сейчас сосредоточиться на переносе; этот этап — в конце очереди.

**Цель:** для каждой страницы, подстраницы, вкладки, табов и модального окна в fe_migration иметь краткое описание:

| Что описать | Содержание |
|-------------|------------|
| **UI** | Основные блоки экрана (шапка, таблица, форма, кнопки), ключевые состояния (пусто, загрузка, ошибка). |
| **Вёрстка** | Адаптивность (брейкпоинты), скролл (где прокручивается), фиксированные высоты/отступы при необходимости. |
| **Функциональность** | Действия пользователя: клики, отправка форм, переключение вкладок, открытие/закрытие модалок; что при этом происходит (навигация, обновление состояния, вызов API/моков). |
| **Зависимости** | От каких компонентов/хуков/моков зависит страница или блок; от каких URL-параметров (например `?tab=`, `:id`). |
| **Логика** | Важная бизнес-логика в компоненте: расчёты, валидация, правила отображения (показывать/скрывать по условию). |

**Охват:**

- Каждая **страница** (один Route) — один документ или один подраздел (например в `docs/pages/` или в комментариях в коде / README по фиче).
- **Подстраницы** (вложенные Route, например `/vacancies/:id`, `/invites/:id/edit`) — отдельно или в том же файле с разделением по URL.
- **Вкладки / табы** на странице (например профиль: profile, edit, schedule; candidate-responses: general, grades, slots) — описать состав вкладки и переключение.
- **Модальные окна** (создание/редактирование интервьюера, подтверждение удаления и т.п.) — триггер открытия, пропсы, обработчики сохранения/отмены.

**Формат:** на усмотрение команды — markdown-файлы в `docs/`, блоки в начале компонента (JSDoc), или общий каталог в `MIGRATION_PLAN.md` со ссылками. Главное — чтобы новый разработчик мог быстро понять, что где лежит и как ведёт себя экран.

**Чеклист по странице (для части L):**

- [ ] Описаны UI и основные блоки.
- [ ] Описана вёрстка (скролл, адаптив).
- [ ] Описана функциональность (действия и результат).
- [ ] Указаны зависимости (компоненты, роут, параметры).
- [ ] Описана ключевая логика (если есть).

---

## Не завершённые и незавершённые улучшения

По состоянию на текущий момент не до конца сделаны или улучшены:

| Область | Что осталось |
|--------|---------------|
| **Шрифты** | Не до конца сделаны и улучшены шрифты по проекту. |
| **Модали просмотра вакансий** | Страница `/vacancies` (например http://localhost:3002/vacancies): модальные окна просмотра/редактирования вакансий требуют доработки и улучшений. |
| **Фильтры по карточкам статистики** | На странице вакансий блок статистики («8 Всего вакансий», «3 Активных», «5 Неактивных») — карточки статистики не фильтруют список при нажатии (ожидается: клик по «Активных» / «Неактивных» применяет соответствующий фильтр). |
| **Иконки на странице вакансий** | В списке и карточках вакансий часть элементов использует эмодзи (например 👥 для интервьюеров) вместо единообразных иконок (Radix UI Icons и т.д.); требуется замена на иконки. |
| **Кнопка «Добавить бенчмарк»** | На странице `/finance/benchmarks` кнопка «Добавить бенчмарк» не работает — требуется привязать к модалке создания/добавления бенчмарка. |
| **Страница бенчмарков** | На странице http://localhost:3002/finance/benchmarks нужно добавить: графики, интервалы и настройки сбора данных. **Ориентир:** настройки сбора данных, интервалы и параметры графиков делаются в соответствующем разделе настроек — **Настройки компании → Финансы** (`/company-settings/finance`); при переносе/доработке страницы бенчмарков согласовать с этим разделом. |
| **Миграция обновлённого меню** | Перенести обновлённое меню из нового приложения (frontend :3000) в fe_migration: пункты, порядок, вложенность, иконки и поведение (раскрытие, активное состояние). |

**Вариант вики для сравнения (предложение по UX/UI):** реализованы страницы **wiki-new** (`/wiki-new`, `/wiki-new/:id`, `/wiki-new/:id/edit`) с четырьмя типами страниц (База знаний, Документация по продукту, Инструкции и гайды, Руководство пользователя), фильтром по типу и категории, бейджем типа на карточках, липким оглавлением (десктоп справа / мобильный раскрывающийся блок), шаблонами контента при создании и блоками в редакторе (инструкция по шагам, FAQ, callout, код). Сравнение: текущая вики — `/wiki`, предложение — `/wiki-new`.

---

## Админка и роли доступа

**Цель:** доработать админку (раздел `/admin` и вложенные маршруты), введя систему ролей с жёстко заданными правами и ограничениями.

**Роли:**

| Роль | Идентификатор / алиас | Описание доступа |
|------|------------------------|------------------|
| **user** | `user` | Обычный пользователь — базовый доступ без дополнительных ограничений по роли (ограничения только по бизнес-логике/настройкам). |
| **admin** | `admin` | Администратор — жёстко заданный набор прав/ограничений на разделы админки и действия. |
| **superadmin** | `superadmin` | Суперадмин — жёстко заданный расширенный набор прав (например, управление компаниями, ролями и т.д.). |
| **supersecurity-admin (csadmin)** | `csadmin` | Админ безопасности — жёстко заданные права только на разделы, связанные с безопасностью, аудитом, доступом. |
| **superuser** | `superuser` | Суперпользователь — жёстко заданный максимальный уровень доступа (все разделы админки, критические операции). |

**Требования:**

- Для всех ролей, **кроме `user`**, явно описать и реализовать жёсткие доступы и ограничения (какие разделы/действия разрешены, какие запрещены).
- Роль `user` — без дополнительных ограничений по этой модели ролей; остальные роли — строго по матрице прав.
- В админке: отображать только те разделы и действия, которые разрешены текущей ролью; недоступное — скрывать или блокировать (в т.ч. API-запросы на запрещённые операции).
- Документировать матрицу «роль → разделы/действия» (в этом плане или в отдельном `docs/admin-roles.md`) и держать её в актуальном состоянии при добавлении новых разделов админки.
