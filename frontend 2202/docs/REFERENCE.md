# HR Helper Frontend — полный справочник

Подробное описание логики, структуры, особенностей и связей приложения.

---

## 1. Назначение приложения

HR Helper — платформа для HR-процессов: рекрутинг, управление сотрудниками, онбординг, обучение, компенсации и отчётность. Меню построено по жизненному циклу: от кандидата до сотрудника, затем C&B и интеграции.

---

## 2. Структура меню (MENU_SECTIONS)

Меню разделено на шесть секций:

1. **Главное** — home, calendar, workflow-chat
2. **Кандидат** — recruiting (всё про подбор)
3. **Сотрудник** — employees (специализации, проекты, справочник, онбординг, L&D, HR-сервисы, вики, внутренний сайт)
4. **C&B** — analytics, finance
5. **Алюмни** — integrations
6. **Настройки компании** — company-settings

**Важно:** `company-settings` берётся из `SETTINGS_MENU_ITEMS`, а не из `MAIN_MENU_ITEMS`. Sidebar объединяет `menuItemsById` и подставляет `company-settings` из настроек в секцию «Настройки компании».

---

## 2.1. Полная иерархия основного меню (MAIN_MENU_ITEMS)

Порядок отображения в сайдбаре соответствует MENU_SECTIONS. Уровень 0 — корневой пункт, 1 — первый уровень вложенности и т.д.

| Ур. | Секция | ID | Название | href | Примечание |
|-----|--------|-----|----------|------|------------|
| 0 | Главное | home | Главная | /workflow | Настраивается через sidebarHomeHref |
| 0 | Главное | calendar | Календарь | /calendar | |
| 0 | Главное | workflow-chat | Workflow chat | /workflow | |
| 0 | Кандидат | recruiting | Рекрутинг | — | Раскрывающийся |
| 1 | Кандидат | recr-chat | ATS \| Talent Pool | /recr-chat/vacancy/1/candidate/1 | |
| 1 | Кандидат | invites | Интервью | /invites | |
| 1 | Кандидат | vacancies | Вакансии | — | Раскрывающийся |
| 2 | Кандидат | vacancies-list | Вакансии | /vacancies | |
| 2 | Кандидат | vacancies-requests | Заявки | /hiring-requests | |
| 1 | Кандидат | interviewers | Интервьюеры | /interviewers | |
| 0 | Сотрудник | employees | Сотрудники | — | Раскрывающийся |
| 1 | Сотрудник | specializations | Специализации | — | Раскрывающийся |
| 2 | Сотрудник | specializations-all | Конфигуратор | /specializations | |
| 2 | Сотрудник | specializations-frontend | Frontend Development | /specializations/frontend/info | |
| 2 | Сотрудник | specializations-backend | Backend Development | /specializations/backend/info | |
| 1 | Сотрудник | projects | Проекты | — | Раскрывающийся |
| 2 | Сотрудник | projects-list | Список проектов | /projects | |
| 2 | Сотрудник | projects-teams | Команды | /projects/teams | |
| 2 | Сотрудник | projects-resources | Ресурсы и аллокация | /projects/resources | |
| 1 | Сотрудник | employees-directory | Справочник | /employees | |
| 1 | Сотрудник | employees-orgchart | Оргструктура | /employees/org-chart | |
| 1 | Сотрудник | employees-profiles | Профили | /employees/profiles | |
| 1 | Сотрудник | onboarding | Онбординг | — | Раскрывающийся |
| 2 | Сотрудник | onboarding-checklists | Чек-листы | /onboarding/checklists | |
| 2 | Сотрудник | onboarding-buddy | Бадди-система | /onboarding/buddy | |
| 2 | Сотрудник | onboarding-docs | Документы | /onboarding/documents | |
| 1 | Сотрудник | learning | L&D | — | Раскрывающийся |
| 2 | Сотрудник | performance | Эффективность | — | Раскрывающийся |
| 3 | Сотрудник | performance-goals | Цели и OKR | /performance/goals | |
| 3 | Сотрудник | performance-reviews | Оценки | /performance/reviews | |
| 3 | Сотрудник | performance-360 | Feedback 360 | /performance/feedback-360 | |
| 3 | Сотрудник | performance-talent | Talent Pool | /performance/talent-pool | |
| 2 | Сотрудник | learning-courses | Курсы | /learning/courses | |
| 2 | Сотрудник | learning-programs | Программы | /learning/programs | |
| 2 | Сотрудник | learning-skills | Матрица навыков | /learning/skills-matrix | |
| 1 | Сотрудник | hr-services | HR-сервисы | — | Раскрывающийся |
| 2 | Сотрудник | hr-services-docs | Документы | /hr-services/documents | |
| 2 | Сотрудник | hr-services-leave | Отпуска | /hr-services/leave | |
| 2 | Сотрудник | hr-services-tickets | Тикет-система | /hr-services/tickets | |
| 2 | Сотрудник | hr-services-time | Учёт времени | /hr-services/time-tracking | |
| 1 | Сотрудник | surveys | Опросы | /hr-services/surveys | |
| 1 | Сотрудник | wiki | Вики | — | Раскрывающийся |
| 2 | Сотрудник | wiki-all | Все статьи | /wiki | |
| 2 | Сотрудник | wiki-intro | Введение | /wiki?category=Введение | |
| 2 | Сотрудник | wiki-arch | Архитектура | /wiki?category=Архитектура | |
| 2 | Сотрудник | wiki-setup | Настройка | /wiki?category=Настройка | |
| 2 | Сотрудник | wiki-usage | Использование | /wiki?category=Использование | |
| 2 | Сотрудник | wiki-integrations | Интеграции | /wiki?category=Интеграции | |
| 2 | Сотрудник | wiki-uncategorized | Без категории | /wiki?category=Без категории | |
| 2 | Сотрудник | wiki-create | Создать статью | /wiki/create | |
| 1 | Сотрудник | internal-site | Внутренний сайт | — | Раскрывающийся |
| 2 | Сотрудник | internal-site-main | Главная | /internal-site | |
| 2 | Сотрудник | internal-site-create | Создать пост | /internal-site/post/create | |
| 0 | C&B | finance | Финансы | — | Раскрывающийся |
| 1 | C&B | finance-salary-ranges | Зарплатные вилки | /vacancies/salary-ranges | |
| 1 | C&B | finance-benchmarks | Бенчмарки | — | Раскрывающийся |
| 2 | C&B | benchmarks-dashboard | Dashboard | /finance/benchmarks | |
| 2 | C&B | benchmarks-all | Все бенчмарки | /finance/benchmarks | |
| 1 | C&B | compensation-benefits | Льготы и бонусы | /compensation/benefits | |
| 0 | C&B | analytics | Отчётность и аналитика | — | Раскрывающийся |
| 1 | C&B | reporting-recruiting | По подбору | — | Раскрывающийся |
| 2 | C&B | reporting-main | Главная | /reporting | |
| 2 | C&B | reporting-hiring-plan | План найма | /reporting/hiring-plan | |
| 2 | C&B | reporting-company | По компании | /reporting/company | |
| 2 | C&B | reporting-recruiter | По рекрутеру | /reporting/recruiter | |
| 2 | C&B | reporting-vacancy | По вакансии | /reporting/vacancy | |
| 2 | C&B | reporting-interviewer | По интервьюеру | /reporting/interviewer | |
| 2 | C&B | reporting-funnel | Воронка | /reporting/funnel | |
| 1 | C&B | reporting-finance | По финансам | — | Раскрывающийся |
| 2 | C&B | reporting-salary | ЗП вилки | /vacancies/salary-ranges | |
| 2 | C&B | reporting-benchmarks | Бенчмарки | /finance/benchmarks | |
| 1 | C&B | reporting-employees | По сотрудникам | — | Раскрывающийся |
| 2 | C&B | reporting-employees-directory | Справочник | /employees | |
| 2 | C&B | reporting-employees-orgchart | Оргструктура | /employees/org-chart | |
| 1 | C&B | reporting-integrations | По интеграциям | — | Раскрывающийся |
| 2 | C&B | reporting-huntflow | Huntflow | /huntflow | |
| 2 | C&B | reporting-aichat | AI Chat | /aichat | |
| 1 | C&B | analytics-group | Аналитика | — | Раскрывающийся |
| 2 | C&B | analytics-dashboard | Дашборды | /analytics | |
| 2 | C&B | analytics-reports | Отчёты | /analytics/reports | |
| 2 | C&B | analytics-metrics | Метрики | /analytics/metrics | |
| 0 | Алюмни | integrations | Интеграции | — | Раскрывающийся |
| 1 | Алюмни | integrations-huntflow | Huntflow | /huntflow | |
| 1 | Алюмни | integrations-aichat | AI Chat | /aichat | |
| 1 | Алюмни | integrations-clickup | ClickUp | — | Без href, children: [] |
| 1 | Алюмни | integrations-notion | Notion | — | Без href, children: [] |
| 1 | Алюмни | integrations-hh | HeadHunter.ru | — | Без href, children: [] |
| 1 | Алюмни | integrations-telegram | Telegram | — | Раскрывающийся |
| 2 | Алюмни | integrations-telegram-login | Вход | /telegram | |
| 2 | Алюмни | integrations-telegram-2fa | 2FA | /telegram/2fa | |
| 2 | Алюмни | integrations-telegram-chats | Чаты | /telegram/chats | |
| 1 | Алюмни | integrations-n8n | n8n | — | Без href, children: [] |
| 0 | Настройки компании | company-settings | Настройки компании | /company-settings | Из SETTINGS_MENU_ITEMS |

---

## 2.2. Полная иерархия меню настроек (SETTINGS_MENU_ITEMS)

**До Separator:** только `company-settings` (отображается в основном меню в секции «Настройки компании»).

**После Separator:** все пункты кроме company-settings, в порядке следования в таблице.

| Ур. | ID | Название | href | Где отображается |
|-----|-----|----------|------|------------------|
| 0 | profile | Профиль | /account/profile | После Separator |
| 0 | settings-integrations | Интеграции и API | /account/profile | После Separator (вкладка integrations) |
| 0 | company-settings | Настройки компании | /company-settings | В основном меню (секция «Настройки компании») |
| 1 | general-settings | Общие настройки | — | Вложено в company-settings |
| 2 | settings-users-list | Пользователи | /settings/users | |
| 2 | settings-roles | Роли | /settings/roles | |
| 2 | settings-user-groups | Группы пользователей | /settings/user-groups | |
| 2 | settings-permissions | Права доступа | /settings/permissions | |
| 1 | module-settings | Настройки модулей | — | Вложено в company-settings |
| 2 | recruiting-settings | Рекрутинг | /company-settings/recruiting | Раскрывающийся |
| 3 | recruiting-settings-rules | Правила привлечения | /company-settings/recruiting/rules | |
| 3 | recruiting-settings-stages | Этапы найма и причины отказа | /company-settings/recruiting/stages | |
| 3 | recruiting-settings-commands | Команды workflow | /company-settings/recruiting/commands | |
| 3 | recruiting-settings-candidate-fields | Дополнительные поля кандидатов | /company-settings/candidate-fields | |
| 3 | recruiting-settings-scorecard | Scorecard | /company-settings/scorecard | |
| 3 | recruiting-settings-rating-scales | Шкалы оценок | /company-settings/rating-scales | |
| 3 | recruiting-settings-sla | SLA | /company-settings/sla | |
| 3 | recruiting-settings-vacancy-prompt | Единый промпт для вакансий | /company-settings/vacancy-prompt | |
| 3 | recruiting-settings-offer-template | Шаблон оффера | /company-settings/recruiting/offer-template | |
| 3 | recruiting-settings-candidate-responses | Ответы кандидатам | /candidate-responses | |
| 2 | module-settings-employees | Сотрудники | /settings/modules/employees | |
| 2 | module-settings-onboarding | Онбординг | /settings/modules/onboarding | |
| 2 | module-settings-performance | Эффективность | /settings/modules/performance | |
| 2 | module-settings-learning | L&D | /settings/modules/learning | |
| 2 | module-settings-finance | Финансы | /settings/modules/finance | |
| 2 | module-settings-hr-services | HR-сервисы | /settings/modules/hr-services | |
| 2 | settings-modules | Модули (вкл/выкл) | /settings/modules | |
| 1 | company-settings-general | Общие | /company-settings | |
| 1 | company-settings-meeting-settings | Настройки встреч | /company-settings/meeting-settings | |
| 1 | company-settings-org-structure | Оргструктура | /company-settings/org-structure | |
| 1 | company-settings-grades | Грейды | /company-settings/grades | |
| 1 | company-settings-rating-scales | Шкалы оценок | /company-settings/rating-scales | |
| 1 | company-settings-lifecycle | Жизненный цикл сотрудников | /company-settings/employee-lifecycle | |
| 1 | company-settings-finance | Финансы | /company-settings/finance | |
| 1 | company-settings-integrations | Интеграции | /company-settings/integrations | |
| 1 | company-settings-custom-fields | Пользовательские поля | /settings/custom-fields | |
| 0 | module-settings-personal | Настройки модулей | /settings/modules | После Separator |
| 0 | settings-workflows | Workflow settings | /settings/workflows | После Separator |
| 0 | admin | Admin | /admin | После Separator (настраивается через sidebarAdminHomeHref) |

---

## 2.3. Порядок отображения в сайдбаре (этапы)

| № | Этап | Действие |
|---|------|----------|
| 1 | Секция «Главное» | Рендер: home (с gear), calendar, workflow-chat |
| 2 | Секция «Кандидат» | Рендер: recruiting (раскрывающийся) |
| 3 | Секция «Сотрудник» | Рендер: employees (раскрывающийся) |
| 4 | Секция «C&B» | Рендер: analytics, finance (раскрывающиеся) |
| 5 | Секция «Алюмни» | Рендер: integrations (раскрывающийся) |
| 6 | Секция «Настройки компании» | Рендер: company-settings (раскрывающийся) |
| 7 | Separator | Разделительная линия |
| 8 | Профиль | Рендер: profile |
| 9 | Интеграции и API | Рендер: settings-integrations |
| 10 | Настройки модулей | Рендер: module-settings-personal |
| 11 | Workflow settings | Рендер: settings-workflows |
| 12 | Admin | Рендер: admin (с кнопкой «Открыть во вкладке» и gear) |

---

## 2.4. Полная иерархия меню админки (ADMIN_MENU_ITEMS)

Левое меню: основной список. Субменю: children активного пункта.

| Ур. | ID | Название | href |
|-----|-----|----------|------|
| 0 | company | Компания | /admin/company |
| 1 | company-general | Общие настройки | /admin/company |
| 1 | company-offices | Офисы и локации | /admin/company/offices |
| 1 | company-schema | Схема полей | /admin/company/schema |
| 0 | users | Пользователи | /admin/users |
| 1 | users-list | Список | /admin/users |
| 1 | users-roles | Роли | /admin/users/roles |
| 1 | users-groups | Группы | /admin/users/groups |
| 1 | users-schema | Схема полей | /admin/users/schema |
| 0 | departments | Отделы | /admin/departments |
| 1 | departments-list | Список | /admin/departments |
| 1 | departments-structure | Оргструктура | /admin/departments/structure |
| 1 | departments-schema | Схема полей | /admin/departments/schema |
| 0 | positions | Должности | /admin/positions |
| 1 | positions-list | Список | /admin/positions |
| 1 | positions-schema | Схема полей | /admin/positions/schema |
| 0 | locations | Локации | /admin/locations |
| 1 | locations-list | Список | /admin/locations |
| 1 | locations-schema | Схема полей | /admin/locations/schema |
| 0 | grades | Грейды | /admin/grades |
| 1 | grades-list | Список | /admin/grades |
| 1 | grades-schema | Схема полей | /admin/grades/schema |
| 0 | roles | Роли | /admin/roles |
| 1 | roles-list | Список | /admin/roles |
| 1 | roles-permissions | Права доступа | /admin/roles/permissions |
| 1 | roles-schema | Схема полей | /admin/roles/schema |
| 0 | custom-fields | Пользовательские поля | /admin/custom-fields |
| 1 | custom-fields-list | Список | /admin/custom-fields |
| 1 | custom-fields-schema | Схема | /admin/custom-fields/schema |
| 0 | field-reference | Справочник полей | /admin/field-reference |
| 1 | field-reference-company | Company | /admin/field-reference/company |
| 1 | field-reference-user | User | /admin/field-reference/user |
| 0 | specializations | Специализации | /admin/specializations |
| 1 | specializations-config | Конфигуратор | /admin/specializations |
| 1 | specializations-frontend | Frontend Development | /admin/specializations/frontend |
| 1 | specializations-backend | Backend Development | /admin/specializations/backend |
| 0 | projects | Проекты | /admin/projects |
| 1 | projects-list | Список проектов | /admin/projects |
| 1 | projects-teams | Команды | /admin/projects/teams |
| 1 | projects-resources | Ресурсы и аллокация | /admin/projects/resources |
| 0 | recruiting | Рекрутинг | /admin/recruiting |
| 1 | recruiting-ats | ATS \| Talent Pool | /admin/recruiting/ats |
| 1 | recruiting-invites | Интервью | /admin/recruiting/invites |
| 1 | recruiting-vacancies | Вакансии | /admin/recruiting/vacancies |
| 1 | recruiting-requests | Заявки | /admin/recruiting/requests |
| 1 | recruiting-interviewers | Интервьюеры | /admin/recruiting/interviewers |
| 1 | recruiting-stages | Этапы найма | /admin/recruiting/stages |
| 1 | recruiting-commands | Команды workflow | /admin/recruiting/commands |
| 1 | recruiting-candidate-fields | Поля кандидатов | /admin/recruiting/candidate-fields |
| 1 | recruiting-scorecard | Scorecard | /admin/recruiting/scorecard |
| 1 | recruiting-sla | SLA | /admin/recruiting/sla |
| 0 | employees | Сотрудники | /admin/employees |
| 1 | employees-directory | Справочник | /admin/employees |
| 1 | employees-orgchart | Оргструктура | /admin/employees/org-chart |
| 1 | employees-profiles | Профили | /admin/employees/profiles |
| 0 | onboarding | Онбординг | /admin/onboarding |
| 1 | onboarding-checklists | Чек-листы | /admin/onboarding/checklists |
| 1 | onboarding-buddy | Бадди-система | /admin/onboarding/buddy |
| 1 | onboarding-docs | Документы | /admin/onboarding/documents |
| 0 | performance | Эффективность | /admin/performance |
| 1 | performance-goals | Цели и OKR | /admin/performance/goals |
| 1 | performance-reviews | Оценки | /admin/performance/reviews |
| 1 | performance-360 | Feedback 360 | /admin/performance/feedback-360 |
| 1 | performance-talent | Talent Pool | /admin/performance/talent-pool |
| 0 | learning | Обучение | /admin/learning |
| 1 | learning-courses | Курсы | /admin/learning/courses |
| 1 | learning-programs | Программы | /admin/learning/programs |
| 1 | learning-skills | Матрица навыков | /admin/learning/skills-matrix |
| 0 | finance | Финансы | /admin/finance |
| 1 | finance-salary-ranges | Зарплатные вилки | /admin/finance/salary-ranges |
| 1 | finance-benchmarks | Бенчмарки | /admin/finance/benchmarks |
| 1 | finance-benefits | Льготы и бонусы | /admin/finance/benefits |
| 0 | hr-services | HR-сервисы | /admin/hr-services |
| 1 | hr-services-docs | Документы | /admin/hr-services/documents |
| 1 | hr-services-leave | Отпуска | /admin/hr-services/leave |
| 1 | hr-services-surveys | Опросы | /admin/hr-services/surveys |
| 1 | hr-services-tickets | Тикет-система | /admin/hr-services/tickets |
| 1 | hr-services-time | Учёт времени | /admin/hr-services/time-tracking |
| 0 | integrations | Интеграции | /admin/integrations |
| 1 | integrations-huntflow | Huntflow | /admin/integrations/huntflow |
| 1 | integrations-aichat | AI Chat | /admin/integrations/aichat |
| 1 | integrations-clickup | ClickUp | /admin/integrations/clickup |
| 1 | integrations-notion | Notion | /admin/integrations/notion |
| 1 | integrations-hh | HeadHunter.ru | /admin/integrations/hh |
| 1 | integrations-telegram | Telegram | /admin/integrations/telegram |
| 1 | integrations-n8n | n8n | /admin/integrations/n8n |
| 0 | wiki | Вики | /admin/wiki |
| 1 | wiki-list | Список статей | /admin/wiki |
| 1 | wiki-settings | Настройки | /admin/wiki/settings |
| 0 | internal-site | Внутренний сайт | /admin/internal-site |
| 1 | internal-site-pages | Страницы | /admin/internal-site |
| 1 | internal-site-settings | Настройки | /admin/internal-site/settings |
| 0 | analytics | Отчётность и аналитика | /admin/analytics |
| 1 | analytics-recruiting | По подбору | /admin/analytics/recruiting |
| 1 | analytics-finance | По финансам | /admin/analytics/finance |
| 1 | analytics-employees | По сотрудникам | /admin/analytics/employees |
| 1 | analytics-integrations | По интеграциям | /admin/analytics/integrations |
| 1 | analytics-dashboard | Дашборды | /admin/analytics/dashboard |
| 1 | analytics-reports | Отчёты | /admin/analytics/reports |
| 1 | analytics-metrics | Метрики | /admin/analytics/metrics |

---

## 3. Sidebar — логика и особенности

### 3.1. Рендер меню

Сначала рендерятся пункты по `MENU_SECTIONS`: для каждой секции берутся `itemIds`, из `menuItemsById` достаётся пункт, рендерится `MenuItemComponent`. После всех секций — `Separator`, затем `settingsItemsAfterSeparator` (все пункты из `SETTINGS_MENU_ITEMS`, кроме `company-settings`).

### 3.2. Настройка «Главная» (home)

Пункт «Главная» имеет выпадающий список (gear icon): выбранная страница сохраняется в `localStorage` под ключом `sidebarHomeHref`. По умолчанию — `/workflow`. При клике на «Главная» выполняется переход на сохранённый href. `mainPagesByBlock` — список блоков и страниц для выбора (Рекрутинг, Календарь, Специализации, Проекты, Сотрудники и т.д.).

### 3.3. Настройка «Admin»

Аналогично: `sidebarAdminHomeHref` в localStorage. По умолчанию — `/admin`. Рядом с пунктом Admin — кнопка «Открыть во внешней вкладке» и выпадающий список для выбора главной страницы админки. `adminMainPagesByBlock` — список блоков (первый href каждого блока выбирается при клике).

### 3.4. Позиционирование Sidebar

- **topOffset:** на странице `/recr-chat` — 112px (Header 64px + StatusBar 48px), на остальных — 64px.
- **Справа:** `position: fixed`, `right: 0`.
- **Анимация:** `transform: translateX(0)` когда открыто, `translateX(100%)` когда закрыто.

### 3.5. Профиль и «Интеграции и API»

Оба пункта ведут на `/account/profile`. Различаются активной вкладкой:

- **Профиль** — `activeTab` = `profile` (или пусто).
- **Интеграции и API** — `activeTab` = `integrations`.

При клике на пункт в localStorage записывается `profileActiveTab`, dispatch `CustomEvent('localStorageChange')` для синхронизации в той же вкладке. ProfilePage читает `profileActiveTab` при инициализации и отображает нужную вкладку.

**Активность в Sidebar:** «Профиль» активен, если pathname = `/account/profile` и `profileActiveTab` не `integrations`. «Интеграции и API» активен, если pathname = `/account/profile` и `profileActiveTab` = `integrations`.

### 3.6. Клик по пункту меню

Приоритеты:

1. Пункт «в разработке»: показ toast, навигация не выполняется.
2. Есть дочерние элементы: раскрытие/сворачивание, навигация не выполняется.
3. Есть href: навигация. Для `/account/profile` — дополнительно устанавливается `profileActiveTab`.

На мобильных (< 768px) после навигации вызывается `onClose` — меню закрывается.

### 3.7. Раскрытие разделов

`shouldBeExpanded = hasChildren && isItemOrChildrenActive(item, pathname)`. При `pathname` раздел с активным пунктом автоматически раскрывает дочерние элементы.

### 3.8. IN_DEVELOPMENT_IDS

Сейчас пустое множество — все пункты ведут навигацию. Пункты из этого множества при клике показывают toast вместо перехода.

---

## 4. Определение активного пункта (isItemOrChildrenActive)

Специальные правила (проверяются до `item.href` и рекурсии по children):

- **home** — активен на `/workflow`.
- **wiki** — активен на `/wiki*`.
- **recruiting** — активен на `/workflow`, `/recr-chat*`, `/invites*`, `/vacancies*`, `/hiring-requests*`, `/interviewers*`.
- **finance** — активен на `/vacancies/salary-ranges*`, `/finance/benchmarks*`, `/compensation*`.
- **company-settings** — активен на `/company-settings*`.
- **module-settings** — активен на `/settings*`, `/company-settings/recruiting*`, `/company-settings/candidate-fields*`, `/company-settings/scorecard*`, `/company-settings/vacancy-prompt*`, `/company-settings/sla*`, `/candidate-responses`.
- **general-settings, settings-modules, settings-user-groups, settings-workflows** — активны на `/settings*`.
- **employees** — активен на `/employees*`, `/specializations*`, `/projects*`, `/onboarding*`, `/learning*`, `/performance*`, `/hr-services*`, `/wiki*`, `/internal-site*`.
- **integrations** — активен на `/huntflow*`, `/aichat*`, `/telegram*`.
- **analytics** — активен на `/analytics*`.
- **reporting-recruiting** — активен на `/reporting*`.

Для остальных — проверка `item.href` (точное совпадение или `pathname.startsWith(item.href)`), затем рекурсия по `children`.

---

## 5. Настройки компании — структура

### 5.1. Вложенность

`company-settings` содержит:

1. **general-settings** (вложено): Пользователи, Роли, Группы пользователей, Права доступа
2. **module-settings** (вложено): Рекрутинг (с подпунктами), Сотрудники, Онбординг, Эффективность, L&D, Финансы, HR-сервисы, Модули вкл/выкл
3. Общие, Настройки встреч, Оргструктура, Грейды, Шкалы оценок, Жизненный цикл, Финансы, Интеграции, Пользовательские поля

### 5.2. Дублирование пользователей и групп

Пользователи и группы доступны по двум путям:

- `/settings/users`, `/settings/user-groups` — из меню «Общие настройки» (general-settings)
- `/company-settings/users`, `/company-settings/user-groups` — из меню «Настройки компании»

Оба маршрута рендерят одни и те же компоненты: `UsersPage`, `UserGroupsPage`.

### 5.3. module-settings-personal

После Separator есть пункт «Настройки модулей» с href `/settings/modules` — быстрый персональный доступ. Полная структура настроек модулей вложена в `company-settings` → `module-settings`.

---

## 6. Главная страница (HomePage)

### 6.1. Фильтр модулей (скролл-меню)

Варианты фильтра: **Все** + группы по аналогии с меню (порядок `HOME_PAGE_GROUP_ORDER`):

Календарь, Workflow чат, Рекрутинг, Онбординг, L&D, C&B, HROps, HR PR, Сотрудники, Внутренний сайт, Опросы, Вики, Проекты, Отчёты и аналитика, Интеграции, Настройки компании.

При выборе «Все» показываются все блоки. При выборе группы — только блоки этой группы. Блоки отображаются плиткой.

### 6.2. Формирование HOME_PAGE_BLOCKS

`collectItemsWithHref` обходит `MAIN_MENU_ITEMS` (без `home`) и `SETTINGS_MENU_ITEMS`, собирает все пункты с `href`. Для каждого вызывается `getFilterModule(blockId)`:

- `calendar` → Календарь
- `workflow-chat` → Workflow чат
- `recr-`, `invites`, `vacancies-`, `interviewers` → Рекрутинг
- `onboarding-` → Онбординг
- `performance-`, `learning-` → L&D
- `finance-`, `benchmarks-`, `compensation-` → C&B
- `hr-services-` → HROps
- `hr-pr-` → HR PR
- `specializations-`, `employees-` → Сотрудники
- `internal-site-` → Внутренний сайт
- `surveys` → Опросы
- `wiki-` → Вики
- `projects-` → Проекты
- `analytics-`, `reporting-` → Отчёты и аналитика
- `integrations-` → Интеграции
- `settings-`, `company-settings`, `module-settings`, `recruiting-settings`, `company-settings-` → Настройки компании

### 6.3. Приветственный тур (driver.js)

Кнопка «Приветственный тур» запускает тур по элементам с `data-tour`. Шаги: header-menu, header-theme, header-profile, header-logout, blocks-wrap, block-{id} для каждого блока. Прогресс сохраняется в `hrhelper-tour-last-step` и `hrhelper-tour-last-url`. При повторном запуске предлагается продолжить с последнего шага или начать заново.

---

## 7. Профиль (ProfilePage)

### 7.1. Вкладки

Вкладки: profile, edit, schedule, theme, integrations, quick-buttons. Активная вкладка хранится в `localStorage` под ключом `profileActiveTab` и в query `?tab=...`.

### 7.2. Инициализация

Сначала проверяется `?tab` в URL, затем `profileActiveTab` в localStorage. По умолчанию — `profile`.

### 7.3. Синхронизация

При смене вкладки: `localStorage.setItem`, `history.replaceState` с `?tab=`, `CustomEvent('localStorageChange')`. ProfilePage слушает `StorageEvent` и `localStorageChange` для синхронизации между вкладками и компонентами.

---

## 8. MainLayout

### 8.1. Состояние меню

`menuOpen` — открыто ли меню. На desktop (≥768px) сохраняется в `localStorage` под ключом `sidebarMenuOpen`. На mobile при загрузке всегда `false`, при resize на mobile — сбрасывается.

### 8.2. Отступы контента

- `marginTop`: 112px для `/recr-chat`, 64px для остальных.
- `marginRight`, `width`: зависят от `menuOpen` (280px ширина сайдбара).
- `contentPadding`: для страниц ошибок можно отключить (убирает padding и border).

### 8.3. Структура

Header, Sidebar, FloatingActions, контент (children), Footer.

---

## 9. AdminLayout

### 9.1. Структура

Левое меню (220px) + субменю + контент (Outlet). Левое меню — `ADMIN_MENU_ITEMS`. Субменю — `children` активного пункта. На `/admin` активной считается «Компания».

### 9.2. Реализованные страницы

С реальными компонентами: Company (offices, schema), Users (roles, groups, schema), Departments (structure, schema), Positions (schema), Locations (schema), Grades (schema), Roles (permissions, schema), CustomFields (schema), FieldReference (company, user).

Остальные блоки — `AdminPlaceholderPage`: specializations, projects, recruiting, employees, onboarding, performance, learning, finance, hr-services, integrations, wiki, internal-site, analytics.

---

## 10. data-tour (тур по приложению)

- **Header:** header-menu, header-theme, header-profile, header-logout
- **Sidebar:** sidebar-{item.id} для каждого пункта
- **Home:** welcome-title, welcome-tour-btn, blocks-wrap, block-{id}
- **CompanySettingsPage:** company-settings-page

---

## 11. localStorage ключи

| Ключ | Назначение |
|------|------------|
| `sidebarMenuOpen` | Открыто ли меню (desktop) |
| `sidebarHomeHref` | Куда ведёт кнопка «Главная» |
| `sidebarAdminHomeHref` | Куда ведёт кнопка «Admin» |
| `profileActiveTab` | Активная вкладка профиля |
| `hrhelper-tour-last-step` | Последний шаг приветственного тура |
| `hrhelper-tour-last-url` | URL для возобновления тура |

---

## 12. Интеграции без href

В меню «Интеграции»: ClickUp, Notion, HeadHunter.ru, n8n — `children: []`, без href. Пункты не кликабельны и не ведут на навигацию.

---

## 13. Маршруты без страниц (404)

Ссылки в меню ведут сюда, но маршрутов нет: `/recr-chat/*`, `/invites`, `/specializations*`, `/projects*`, `/employees*`, `/onboarding/*`, `/performance/*`, `/learning/*`, `/hr-services/*`, `/huntflow`, `/telegram*`, `/reporting/*` (кроме `/reporting`), `/analytics/*`, `/compensation/benefits`. Часть разделов доступна в админке по `/admin/...`.

---

## 14. Страница настроек компании (/company-settings)

`CompanySettingsPage` рендерит заголовок «Общие настройки» и компонент `GeneralSettings`. Внутри GeneralSettings — форма общих настроек компании (офисы, логотип и т.д.). Остальные страницы настроек (оргструктура, грейды, шкалы и т.д.) — отдельные роуты с отдельными компонентами.

---

## 15. Вики — категории

Пункты «Введение», «Архитектура», «Настройка» и т.д. ведут на `/wiki?category=...`. Один маршрут `/wiki`, различие в query-параметре.
