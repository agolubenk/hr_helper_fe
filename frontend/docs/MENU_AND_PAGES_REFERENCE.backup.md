# Справочник по меню и страницам

Соответствие пунктов меню, маршрутов и компонентов.

**Легенда:** ✅ Реализовано | ⚠️ Заглушка | ❌ Маршрут отсутствует

---

## MENU_SECTIONS

Главное → Кандидат → Сотрудник → C&B → Алюмни → Настройки компании

---

## 1. ГЛАВНОЕ

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| Главная | /workflow (настр.) | / | HomePage | ✅ |
| Календарь | /calendar | /calendar | CalendarPage | ✅ |
| Workflow chat | /workflow | /workflow | PlaceholderPage | ⚠️ |

---

## 2. КАНДИДАТ (Рекрутинг)

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| ATS \| Talent Pool | /recr-chat/vacancy/1/candidate/1 | — | — | ❌ |
| Интервью | /invites | — | — | ❌ |
| Вакансии | /vacancies | /vacancies | PlaceholderPage | ⚠️ |
| Заявки | /hiring-requests | /hiring-requests | PlaceholderPage | ⚠️ |
| Интервьюеры | /interviewers | /interviewers | PlaceholderPage | ⚠️ |

---

## 3. СОТРУДНИК

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| Конфигуратор | /specializations | — | — | ❌ |
| Frontend/Backend | /specializations/.../info | — | — | ❌ |
| Список проектов | /projects | — | — | ❌ |
| Команды, Ресурсы | /projects/... | — | — | ❌ |
| Справочник | /employees | — | — | ❌ |
| Оргструктура | /employees/org-chart | — | — | ❌ |
| Профили | /employees/profiles | — | — | ❌ |
| Онбординг (чек-листы, бадди, документы) | /onboarding/* | — | — | ❌ |
| L&D (цели, оценки, курсы и др.) | /performance/*, /learning/* | — | — | ❌ |
| HR-сервисы | /hr-services/* | — | — | ❌ |
| Опросы | /hr-services/surveys | — | — | ❌ |
| Вики | /wiki | /wiki | WikiListPage | ✅ |
| Внутренний сайт | /internal-site | /internal-site | InternalSitePage | ✅ |

---

## 4. C&B

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| Отчётность | /reporting | /reporting | PlaceholderPage | ⚠️ |
| Отчётность (подстраницы) | /reporting/* | — | — | ❌ |
| ЗП вилки, Бенчмарки | /vacancies/salary-ranges, /finance/benchmarks | есть | PlaceholderPage | ⚠️ |
| Льготы и бонусы | /compensation/benefits | — | — | ❌ |
| Аналитика | /analytics/* | — | — | ❌ |

---

## 5. АЛЮМНИ (Интеграции)

| Пункт | href | Маршрут | Компонент | Статус |
|-------|------|---------|-----------|--------|
| Huntflow | /huntflow | — | — | ❌ |
| AI Chat | /aichat | /aichat | PlaceholderPage | ⚠️ |
| ClickUp, Notion, HH, n8n | — | — | Без href | — |
| Telegram | /telegram, /telegram/2fa, /telegram/chats | — | — | ❌ |

---

## 6. НАСТРОЙКИ КОМПАНИИ

| Пункт | href | Компонент | Статус |
|-------|------|-----------|--------|
| Общие настройки → Пользователи, Роли, Группы, Права | /settings/* | UsersPage, UserGroupsPage, PlaceholderPage | ✅/⚠️ |
| Настройки модулей → Рекрутинг, Сотрудники и др. | /company-settings/recruiting, /settings/modules/* | Разные | ✅/⚠️ |
| Общие, Встречи, Оргструктура, Грейды, Шкалы, Жизненный цикл, Финансы, Интеграции, Пользовательские поля | /company-settings/* | Реализовано | ✅ |

---

## 7. ПОСЛЕ SEPARATOR

| Пункт | href | Компонент | Статус |
|-------|------|-----------|--------|
| Профиль | /account/profile | ProfilePage | ✅ |
| Интеграции и API | /account/profile (вкладка) | ProfilePage | ✅ |
| Настройки модулей | /settings/modules | PlaceholderPage | ⚠️ |
| Workflow settings | /settings/workflows | PlaceholderPage | ⚠️ |
| Admin | /admin | AdminLayout | ✅ |
