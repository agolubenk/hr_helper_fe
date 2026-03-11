# Доопределение пунктов приложения (по архитектуре)

Документ фиксирует недопроработанные пункты, ориентируясь на архитектурную концепцию (3-уровневая модель, блоки 1–7, Lifecycle FSM).

---

## 1. FSM (пункт 3) — решение

### Выбор подхода

**Вариант:** Кнопки переходов + модальное окно для сбора данных (A + C из теории).

### Обоснование

- Явные действия, понятные пользователю
- Модалка позволяет собирать доп. данные при переходе (hire_date, compensation при `hire`)
- Соответствует viewflow.fsm на бэкенде: каждый переход — отдельный метод

### Реализация на фронте

| Элемент | Описание |
|---------|----------|
| **StateBadge** | Бейдж стейта с цветом по группе: pre-employment (серый), onboarding (синий), active (зелёный), separation (оранжевый), alumni (фиолетовый) |
| **StateTransitionButton** | Кнопка с `label`, `transition` (имя метода API), `disabled` если переход недоступен |
| **StateTransitionModal** | Модалка с полями для перехода (зависит от `transition`), кнопки «Подтвердить» / «Отмена» |
| **available_transitions** | API возвращает список доступных переходов для текущего стейта (из viewflow.fsm) |

### FSM-модели в приложении

| Модель | Поле | Стейты (из архитектуры) |
|--------|------|-------------------------|
| **User** | `lifecycle_state` | CANDIDATE → OFFER_EXTENDED → OFFER_ACCEPTED → HIRED → ONBOARDING → ACTIVE → ON_LEAVE → UNDER_REVIEW → PERFORMANCE_IMPROVEMENT → NOTICE_PERIOD → SEPARATED → ALUMNI |
| **Vacancy** | `status` | DRAFT → OPEN → ON_HOLD → CLOSED (уточнить) |
| **Candidate** | `overall_status` | NEW → SCREENING → INTERVIEW → OFFER → HIRED / REJECTED (уточнить) |
| **Interview** | `status` | SCHEDULED → COMPLETED → CANCELLED / NO_SHOW |
| **Enrollment** | `status` | ENROLLED → IN_PROGRESS → COMPLETED / DROPPED |
| **UserBenefit** | `status` | ACTIVE → SUSPENDED → TERMINATED |
| **Project** | `status` | PLANNING → ACTIVE → ON_HOLD → COMPLETED / CANCELLED |

### Где отображать FSM

- **User card** — `lifecycle_state`, кнопки: extend_offer, hire, start_onboarding, complete_onboarding, start_notice, separate
- **Candidate card** — `overall_status`, кнопки по этапам (move to next stage, reject, hire)
- **Vacancy card** — `status`, кнопки: publish, close, reopen
- **Employee Lifecycle (настройки)** — конфигурация этапов и переходов (какие стейты в каком блоке), без drag-and-drop этапов; этапы = LifecycleState

---

## 2. State Management (пункт 6)

### Выбор

**React Query (TanStack Query) + REST API.**

### Обоснование

- Сервер — источник истины
- Кэш, инвалидация, retry из коробки
- Подходит для CRUD, списков, карточек
- WebSocket — позже, если понадобится real-time

### Структура

```
src/shared/api/
  client.ts          # axios/fetch base
  queries/
    company.ts       # useCompany, useDepartments, useLocations
    users.ts         # useUsers, useUser, useUserRoles
    recruiting.ts    # useVacancies, useCandidates, useInterviews
    ...
  mutations/
    company.ts       # useUpdateCompany, useCreateDepartment
    users.ts         # useUpdateUser, useUserTransition (FSM)
    ...
```

### UI-состояние

**Zustand** (уже есть) — для модалок, фильтров, выбранных табов. Не для серверных данных.

### Оптимистичные обновления

- Пока не используем
- Добавить позже для частых действий (drag-and-drop кандидатов по этапам)

---

## 3. Визуализация (пункт 7)

### Выбор

**Таблицы + базовые графики (комбинированный).**

### По блокам

| Блок | Представление | Детали |
|------|---------------|--------|
| **Users, Candidates, Vacancies** | Таблицы с фильтрами, сортировкой | Стандартный DataGrid |
| **Recruiting pipeline** | Kanban | Колонки = RecruitingStage, карточки = Candidate |
| **Employee Lifecycle** | Timeline / Journey | Визуализация пути User по стейтам (опционально, фаза 2) |
| **OrgStructure** | Дерево + схема | Уже есть |
| **Finance (C&B)** | Таблицы + простые графики | Распределение зарплат, бенчмарки (bar chart) |
| **Analytics** | Дашборды | Воронка найма, turnover, обучение — позже |

### Библиотеки

- Таблицы: Radix Table (уже есть) или TanStack Table
- Графики: Recharts или Chart.js (лёгкий)
- Kanban: @dnd-kit (уже есть) для drag-and-drop

---

## 4. Custom Attributes — формат API (пункт 4, детализация)

### Контракт API

**Вариант:** API возвращает объединённый объект — фиксированные поля + `custom_attributes` в одном JSON.

```json
{
  "id": 1,
  "first_name": "Иван",
  "last_name": "Петров",
  "lifecycle_state": "active",
  "hire_date": "2024-01-15",
  "custom_attributes": {
    "preferred_name": "Ваня",
    "emergency_contact": "+7 999 123-45-67",
    "internal_note": "Ключевой сотрудник"
  }
}
```

### Схема custom_attributes (для редактора)

Отдельный endpoint или в настройках сущности:

```json
{
  "User": [
    { "key": "preferred_name", "type": "string", "label": "Предпочитаемое имя", "required": false },
    { "key": "emergency_contact", "type": "string", "label": "Контакт для экстренной связи" },
    { "key": "internal_note", "type": "text", "label": "Внутренняя заметка" }
  ],
  "Candidate": [...],
  "Vacancy": [...]
}
```

### Компонент на фронте

- `CustomAttributesEditor` — рендерит поля по схеме (string → TextField, number → NumberField, date → DatePicker, select → Select)
- Если схемы нет — fallback: key-value список (тип D, гибрид)

---

## 5. Навигация — конфиг из админки (пункт 5, детализация)

### Источник данных

- Отдельное приложение / админка
- API: `GET /api/ui-config/` → `{ menu: [...], header: [...], footer: [...] }`

### Структура конфига меню

```json
{
  "menu": [
    {
      "id": "company-settings",
      "label": "Настройки компании",
      "icon": "company",
      "href": "/company-settings",
      "children": [
        { "id": "general", "label": "Общие", "href": "/company-settings" },
        { "id": "org-structure", "label": "Оргструктура", "href": "/company-settings/org-structure" }
      ],
      "permissions": ["view_company_settings"]
    }
  ],
  "header": [
    { "type": "logo", "position": "left" },
    { "type": "search", "position": "center" },
    { "type": "user_menu", "position": "right" }
  ],
  "footer": [
    { "type": "links", "items": [{ "label": "Политика", "href": "/privacy" }] }
  ]
}
```

### На фронте

- Загрузка конфига при старте приложения (React Query)
- Рендер Sidebar, Header, Footer по конфигу
- Fallback: текущий хардкод `SETTINGS_MENU_ITEMS`, если API недоступен

---

## 6. Критические вопросы (1–5) — фиксация для MVP

| # | Вопрос | Решение для MVP |
|---|--------|-----------------|
| **1. Wiki** | Internal knowledge base? Структура? | Да, internal. Статьи с версиями, категории, права по группам. Реализация — после Фазы 2. |
| **2. HROps** | Какие процессы? | Time-off (заявки, approval), Equipment (чеклист онбординга), Compliance (подписи). Реализация — после Фазы 2. |
| **3. Воркфлоу** | Кастомные процессы? | Approval chains (PTO, budget, compensation), onboarding/offboarding чеклисты. Реализация — после Фазы 2. |
| **4. Сайт** | Careers или internal? | Уточнить. Если careers — публичные вакансии, форма отклика. Если internal — dashboard. |
| **5. Интеграции** | Приоритет? | Slack, Email, Calendar, ATS (Huntflow). Настройки в Integrations, лог событий. |

---

## 7. Маппинг архитектуры → приложение (сводка)

| Архитектурный блок | Есть | Нет | Приоритет |
|--------------------|------|-----|-----------|
| **1. CompanySettings** | GeneralSettings (офисы, лого) | legal_name, tax_id, headquarters, timezone, industry, company_size, fiscal_year_start, work_schedule, probation/notice days | Фаза 1 |
| **2. UserSettings** | Users list | employee_id, lifecycle_state, department, position, manager, location, dates, UserRole | Фаза 1 |
| **3. Recruiting** | Stages, Commands, Candidate Fields, Scorecard, SLA | Vacancy CRUD, Candidate CRUD, Interview, Evaluation | Фаза 2 |
| **4. L&D** | — | EvaluationTemplate, Evaluation, LearningProgram, Enrollment | Фаза 2 |
| **5. C&B** | Finance (частично) | CompensationPackage, Benchmark, Benefit, UserBenefit | Фаза 3 |
| **6. Specializations** | — | Specialization, Skill, UserSkill | Фаза 3 |
| **7. Projects** | — | Project, ProjectAssignment | Фаза 3 |
| **Lifecycle FSM** | Employee Lifecycle (этапы) | Привести к LifecycleState, кнопки переходов | Фаза 1 |
| **Custom Attributes** | — | CustomAttributesEditor, схемы | Фаза 1 |
| **UI Config** | Хардкод меню | API конфиг, рендер по конфигу | Фаза 1 |

---

## 8. Итоговые решения (чеклист)

- [x] **Архитектура:** Монорепо
- [x] **UX:** Комбинированный (Dashboard + Kanban + CRUD + Timeline), постепенно
- [x] **FSM:** Кнопки + модалка, StateBadge, available_transitions из API
- [x] **Custom Attributes:** Ядро фиксировано, доп. через JSON, API отдаёт всё в JSON; схемы для редактора
- [x] **Навигация:** Конфиг из API (меню, хедер, футер), отдельное приложение для настройки
- [x] **State Management:** React Query + REST, Zustand для UI
- [x] **Визуализация:** Таблицы + Kanban (recruiting) + базовые графики (C&B)
- [ ] **Критические вопросы 1–5:** Зафиксированы для MVP, детализация по мере реализации
