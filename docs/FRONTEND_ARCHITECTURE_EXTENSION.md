# Расширение фронтенда под новую архитектуру

## Текущее состояние vs целевая архитектура

### Уже есть на фронте

| Блок | Страница | Соответствие бэкенду |
|------|----------|----------------------|
| CompanySettings | `/company-settings` (GeneralSettings) | Частично — офисы, лого; нет полей Company из архитектуры |
| OrgStructure | `/company-settings/org-structure` | Department tree; нет Position, Location |
| Grades | `/company-settings/grades` | Грейды; связь с C&B |
| Employee Lifecycle | `/company-settings/employee-lifecycle` | Этапы (Новый, Оффер, Онбординг…); **нужно привести к FSM LifecycleState** |
| Finance | `/company-settings/finance` | Частично C&B; нет CompensationPackage, Benchmark |
| Recruiting | Stages, Commands, Candidate Fields, Scorecard, SLA | Vacancy, Candidate, RecruitingStage; нет Interview, Evaluation |
| Users | `/settings/users` | User; нет lifecycle_state, UserRole |
| Integrations | `/company-settings/integrations` | — |

### Чего нет на фронте

- **UserSettings** — расширенные поля User (employee_id, lifecycle_state, hire_date, probation_end_date и т.д.)
- **L&D** — EvaluationTemplate, Evaluation, LearningProgram, Enrollment
- **C&B** — CompensationPackage, Benchmark, Benefit, UserBenefit
- **Specializations** — Specialization, Skill, UserSkill
- **Projects** — Project, ProjectAssignment
- **Custom Attributes** — UI для `custom_attributes` (JSONField)
- **FSM-воркфлоу** — визуализация и переходы по стейтам (LifecycleState, VacancyStatus, CandidateStatus и т.д.)

---

## План расширения фронтенда

### 1. Общие компоненты и инфраструктура

#### 1.1 Типы и API-клиент

```
src/shared/api/
  types/
    company.ts      # Company, Department, Location
    user.ts         # User, UserRole, LifecycleState
    recruiting.ts   # Vacancy, Candidate, RecruitingStage, Interview
    learning.ts     # EvaluationTemplate, Evaluation, LearningProgram, Enrollment
    compensation.ts # CompensationPackage, Benchmark, Benefit
    specialization.ts
    project.ts
  endpoints/
    company.ts
    users.ts
    recruiting.ts
    ...
```

#### 1.2 Компоненты для custom_attributes

- `CustomAttributesEditor` — универсальный редактор JSON-полей по схеме (Pydantic → JSON Schema → форма)
- `CustomAttributesDisplay` — отображение custom_attributes в карточках

#### 1.3 FSM-компоненты

- `StateBadge` — бейдж стейта с цветом по типу (candidate/hired/active/separated)
- `StateTransitionButton` — кнопка перехода с подтверждением
- `StateFlowDiagram` — визуализация FSM (опционально, для админки)

---

### 2. Блоки по приоритету

#### Фаза 1: Ядро (Company + User + Lifecycle)

| Задача | Детали |
|--------|--------|
| **GeneralSettings** | Добавить поля: legal_name, tax_id, headquarters_country/city, timezone, industry, company_size, fiscal_year_start, default_work_schedule, probation_period_days, notice_period_days |
| **UserSettings / Users** | Расширить карточку пользователя: employee_id, lifecycle_state (FSM), department, position, manager, location, hire_date, probation_end_date, contract_end_date, separation_date |
| **Employee Lifecycle** | Привести к LifecycleState (CANDIDATE → HIRED → ONBOARDING → ACTIVE → …). Drag-and-drop этапов заменить на FSM-переходы. Добавить кнопки `extend_offer`, `hire`, `start_onboarding`, `complete_onboarding` и т.д. |
| **OrgStructure** | Добавить Position, Location; связь User → Department, Position, Location |

#### Фаза 2: Recruiting + L&D

| Задача | Детали |
|--------|--------|
| **Vacancy** | CRUD вакансий с полями: specialization, department, employment_type, seniority_level, headcount, salary_min/max, hiring_manager, recruiters, status (FSM) |
| **Candidate** | Карточка кандидата: source, vacancy, current_stage, overall_status (FSM), resume, linkedin_url |
| **RecruitingStage** | Этапы с interviewers, evaluation_template |
| **Interview** | Интервью: scheduled_date, interviewer, status, evaluation, recommendation |
| **EvaluationTemplate** | Шаблоны оценок (criteria, scale_type) |
| **Evaluation** | Оценка (target: candidate/employee, scores, overall_score) |
| **LearningProgram** | Программы обучения |
| **Enrollment** | Записи на обучение, progress, status |

#### Фаза 3: C&B + Specializations + Projects

| Задача | Детали |
|--------|--------|
| **CompensationPackage** | Пакеты компенсации (base_salary, bonus, equity, effective_from/to) |
| **Benchmark** | Бенчмарки по specialization/seniority/location |
| **Benefit / UserBenefit** | Льготы и привязка к пользователям |
| **Specialization / Skill / UserSkill** | Специализации, навыки, уровни |
| **Project / ProjectAssignment** | Проекты, назначения, allocation |

---

### 3. Ответы на критические вопросы (для финализации MVP)

#### 1. Wiki

- **Рекомендация:** Internal knowledge base.
- **Структура:** Статьи с версиями (версионирование контента), категории/теги, права доступа (по группам/ролям).
- **Фронт:** Список статей, редактор (Markdown/WYSIWYG), история версий, поиск.

#### 2. HROps / HR BP+Support / Global HR

- **Рекомендация для MVP:** Выделить процессы:
  - **Time-off** — заявки на отпуск/больничный, approval chain
  - **Equipment** — выдача оборудования (чеклист при онбординге)
  - **Relocation** — запросы на переезд (опционально)
  - **Compliance** — чеклисты (подписи, политики)
- **Фронт:** Заявки (тип, статус FSM), approval UI, чеклисты.

#### 3. Воркфлоу (django-viewflow)

- **Рекомендация:** Кастомные процессы:
  - Approval chains: budget, PTO, promotions, compensation changes
  - Onboarding checklist (задачи для HROps)
  - Offboarding checklist
- **Фронт:** Список задач текущего пользователя, кнопки approve/reject, история.

#### 4. Сайт

- **Уточнение:** Careers site (публичные вакансии) или internal portal?
- **Если careers:** Публичные вакансии, форма отклика, статус кандидата.
- **Если internal:** Dashboard, уведомления, быстрые действия.

#### 5. Интеграции (приоритет для MVP)

- **Рекомендация:** Slack (уведомления), Email (приглашения, офферы), Calendar (интервью), ATS внешние (Huntflow, Greenhouse — если есть).
- **Фронт:** Настройки интеграций (OAuth, webhooks), лог событий.

---

### 4. Структура роутов (расширенная)

```
/company-settings
  /                    → GeneralSettings (расширенный)
  /org-structure       → OrgStructure (Department + Position + Location)
  /grades              → Grades
  /employee-lifecycle  → Employee Lifecycle (FSM-этапы + переходы)
  /finance             → Finance (C&B: Compensation, Benchmark, Benefits)
  /integrations        → Integrations
  /custom-fields       → Custom Attributes (схемы для JSONField)

/settings/users        → Users (расширенная карточка User)
/settings/roles        → UserRole
/settings/user-groups  → UserGroups

/recruiting
  /vacancies          → Vacancy list + CRUD
  /candidates         → Candidate list + card
  /stages             → RecruitingStage (уже есть)
  /interviews         → Interview calendar

/learning
  /programs           → LearningProgram
  /enrollments        → Enrollment
  /evaluations        → EvaluationTemplate + Evaluation

/specializations       → Specialization, Skill, UserSkill
/projects             → Project, ProjectAssignment

/wiki                  → Wiki (статьи, редактор)
/workflows             → Задачи текущего пользователя (approval chains)
```

---

### 5. Компоненты для переиспользования

| Компонент | Назначение |
|-----------|------------|
| `EntityCard` | Карточка сущности (User, Candidate, Vacancy…) с FSM-бейджем |
| `EntityForm` | Форма с железными полями + CustomAttributesEditor |
| `StateTransitionPanel` | Панель кнопок перехода по FSM |
| `DateRangePicker` | effective_from / effective_to |
| `MoneyInput` | salary, budget с currency |
| `SelectAsync` | FK-поля с поиском (User, Department, Specialization) |

---

### 6. Следующие шаги

1. **Подтвердить** ответы на вопросы 1–5.
2. **Определить** API-endpoints (REST/GraphQL) и контракты.
3. **Реализовать** Фазу 1 (Company, User, Lifecycle) на бэкенде и фронте.
4. **Добавить** CustomAttributesEditor как универсальный компонент.
5. **Настроить** FSM-переходы в Employee Lifecycle и User card.
