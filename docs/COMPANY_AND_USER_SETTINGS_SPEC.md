# Настройки компании и пользователя — спецификация

Фокус: блоки **CompanySettings** и **UserSettings** по архитектуре. Текущее состояние и план доработки.

---

## 0. Аудит: все ли поля и аспекты учтены?

### 0.1 Company — полный чеклист

| Поле (архитектура) | В спецификации | На фронте | Примечание |
|--------------------|----------------|-----------|------------|
| `name` | ✅ | ✅ | |
| `legal_name` | ✅ | ❌ | |
| `tax_id` | ✅ | ❌ | |
| `headquarters_country` | ✅ | ❌ | |
| `headquarters_city` | ✅ | ❌ | |
| `timezone` | ✅ | ❌ | |
| `industry` | ✅ | ❌ | |
| `company_size` | ✅ | ❌ | |
| `fiscal_year_start` | ✅ | ❌ | |
| `default_work_schedule` | ✅ | ❌ | |
| `probation_period_days` | ✅ | ❌ | |
| `notice_period_days` | ✅ | ❌ | |
| `logo` | ✅ | ✅ | |
| `is_active` | ❌ | ❌ | **Пропущено** — добавить (toggle) |
| `created_at` | ❌ | ❌ | **Пропущено** — read-only, отображать при необходимости |
| `custom_attributes` | ✅ | ❌ | |

**Доп. на фронте (нет в архитектуре):**

| Поле | Решение |
|------|---------|
| `calendarLink` | Оставить как есть или перенести в `custom_attributes` |

---

### 0.2 User — полный чеклист

| Поле (архитектура) | В спецификации | На фронте | Примечание |
|--------------------|----------------|-----------|------------|
| `employee_id` | ✅ | ❌ | |
| `first_name` | ✅ | ✅ | |
| `last_name` | ✅ | ✅ | |
| `email` | ✅ | ✅ | |
| `phone` | ✅ | ❌ | |
| `lifecycle_state` | ✅ | ❌ | |
| `company` | ❌ | ❌ | **Пропущено** — обычно не редактируется (текущая компания) |
| `department` | ✅ | ❌ | |
| `position` | ✅ | ✅ (строка) | Нужен FK |
| `manager` | ✅ | ❌ | |
| `location` | ✅ | ❌ | |
| `timezone` | ✅ | ❌ | |
| `hire_date` | ✅ | ❌ | |
| `probation_end_date` | ✅ | ❌ | |
| `contract_end_date` | ✅ | ❌ | |
| `separation_date` | ✅ | ❌ | |
| `is_interviewer` | ✅ | ❌ | |
| `avatar` | ✅ | ❌ | |
| `custom_attributes` | ✅ | ❌ | |

**AbstractUser / Django (часто нужны):**

| Поле | В спецификации | На фронте | Примечание |
|------|----------------|-----------|------------|
| `username` | ❌ | ❌ | **Пропущено** — для логина, может = email |
| `password` | ❌ | ❌ | Отдельная форма смены пароля |
| `is_active` | ❌ | ✅ | **Пропущено в спецификации** — уже есть |
| `is_staff` | ❌ | ❌ | Админка, редко в UI |
| `is_superuser` | ❌ | ❌ | Админка |
| `date_joined` | ❌ | ✅ (created_at) | **Пропущено** — отображать read-only |
| `last_login` | ❌ | ✅ | **Пропущено** — уже есть |

**Profile API (отдельный контекст — настройки текущего пользователя):**

| Поле | Где | Примечание |
|------|-----|------------|
| `telegram_username` | Profile | Либо User.phone/другое, либо custom_attributes |
| `interview_start_time`, `interview_end_time` | Profile | Рабочие часы интервьюера — MeetingSettings или User |
| `meeting_interval_minutes` | Profile | Интервал встреч |
| `work_time_by_day` | Profile | Рабочие часы по дням |

**Доп. на фронте (UsersSettings):**

| Поле | Решение |
|------|---------|
| `groups` | Сопоставить с UserRole или оставить как есть |
| `access` | UserAccessModal — права доступа, связь с UserRole/permissions |

---

### 0.3 UserRole — полный чеклист

| Поле | В спецификации | Примечание |
|------|----------------|------------|
| `user` | ✅ | FK |
| `role_type` | ✅ | EMPLOYEE, CANDIDATE, INTERVIEWER, ADMIN |
| `context` | ✅ | global, department, project |
| `context_id` | ✅ | ID контекста |

---

### 0.4 Связанные сущности (Department, Position, Location)

**Department** (OrgStructure) — поля для CRUD:

| Поле | На фронте | В спецификации Company/User |
|------|-----------|-----------------------------|
| id, name, slug, short_name | ✅ | — |
| parent | ✅ | — |
| description | ✅ | — |
| manager | ✅ (string) | FK User — нужен Select |
| location | ✅ (string) | FK Location — нужен Select |
| created_at, updated_at | ✅ | — |
| employee_count | ✅ | — |

**Position** — в архитектуре User.position = FK Position, но модель Position не расписана:

| Предполагаемые поля | Примечание |
|---------------------|------------|
| name | Название должности |
| department | FK Department (опционально) |
| grade | FK Grade (связь с грейдами) |

**Location / Office** — маппинг:

| Office (фронт) | Location (архитектура) |
|----------------|------------------------|
| name | name |
| address | address |
| mapLink | url или custom |
| country, city | country, city |
| directions | directions |
| description | description |
| isMain | is_headquarters или флаг |
| logo | logo |

---

### 0.5 Итог: что добавить в спецификацию

1. **Company:** `is_active`, `created_at` (read-only)
2. **User:** `company` (read-only, если одна компания), `username` (если нужен для логина), `is_active` (уже есть — явно в спецификацию), `date_joined` (read-only)
3. **Position:** определить модель и поля (name, department?, grade?)
4. **Profile vs User:** разграничить — Profile = настройки текущего пользователя (рабочие часы, telegram); User = карточка сотрудника в админке
5. **calendarLink:** решение — оставить в Company или в custom_attributes

---

## 1. CompanySettings (Настройки компании)

### 1.1 Архитектура (железные поля)

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Название компании |
| `legal_name` | string | Юридическое название |
| `tax_id` | string | ИНН / Tax ID |
| `headquarters_country` | string (ISO 3166-1) | Страна штаб-квартиры |
| `headquarters_city` | string | Город штаб-квартиры |
| `timezone` | string (IANA) | Часовой пояс |
| `industry` | string | Отрасль |
| `company_size` | integer | Численность |
| `fiscal_year_start` | date | Начало фин. года |
| `default_work_schedule` | choice | full-time / part-time |
| `probation_period_days` | integer | Испытательный срок (дней) |
| `notice_period_days` | integer | Срок уведомления (дней) |
| `logo` | image | Логотип |
| `is_active` | boolean | Активна |
| `custom_attributes` | JSON | Доп. поля |

**Связи:** User, Department, Location (офисы/локации).

---

### 1.2 Что есть на фронте (GeneralSettings)

| Поле | Есть | Комментарий |
|------|------|-------------|
| `name` | ✅ | «Название компании» |
| `logo` | ✅ | «Логотип компании» |
| `calendarLink` | ✅ | Не в архитектуре — оставить как custom или перенести в custom_attributes |
| **Офисы (Office)** | ✅ | name, address, mapLink, country, city, directions, description, isMain, logo |

**Нет:** legal_name, tax_id, headquarters_country/city, timezone, industry, company_size, fiscal_year_start, default_work_schedule, probation_period_days, notice_period_days, custom_attributes.

---

### 1.3 План доработки CompanySettings

#### Секция «Основные данные» (расширить текущую карточку)

- [ ] `legal_name` — юридическое название
- [ ] `tax_id` — ИНН (опционально)
- [ ] `headquarters_country` — Select/Combobox (ISO коды или список стран)
- [ ] `headquarters_city` — город
- [ ] `timezone` — Select (IANA timezone, например Europe/Minsk)
- [ ] `industry` — Select или TextField (отрасль)
- [ ] `company_size` — NumberField (численность)

#### Секция «HR-параметры» (новая)

- [ ] `fiscal_year_start` — DatePicker (месяц/день начала года, например 01.01)
- [ ] `default_work_schedule` — Select (full-time / part-time)
- [ ] `probation_period_days` — NumberField (по умолчанию 90)
- [ ] `notice_period_days` — NumberField (по умолчанию 30)

#### Секция «Система»

- [ ] `is_active` — Switch (компания активна)
- [ ] `created_at` — read-only (дата создания, отображать при необходимости)

#### Офисы / Location

- Оставить текущую модель Office как есть (или сопоставить с Location в API)
- Поля: name, address, mapLink, country, city, directions, description, isMain, logo

#### Custom Attributes

- [ ] Блок «Дополнительные поля» — `CustomAttributesEditor` по схеме для Company

---

## 2. UserSettings (Настройки пользователя)

### 2.1 Архитектура (железные поля User)

| Поле | Тип | Описание |
|------|-----|----------|
| `employee_id` | string | Табельный номер |
| `first_name` | string | Имя |
| `last_name` | string | Фамилия |
| `email` | string | Email |
| `phone` | string | Телефон |
| `lifecycle_state` | FSM | CANDIDATE → HIRED → … → ALUMNI |
| `company` | FK | Компания |
| `department` | FK | Отдел |
| `position` | FK | Должность |
| `manager` | FK (self) | Руководитель |
| `location` | FK | Локация/офис |
| `timezone` | string | Часовой пояс |
| `hire_date` | date | Дата найма |
| `probation_end_date` | date | Конец испытательного |
| `contract_end_date` | date | Конец контракта |
| `separation_date` | date | Дата увольнения |
| `is_interviewer` | boolean | Интервьюер |
| `avatar` | image | Аватар |
| `custom_attributes` | JSON | Доп. поля |

**UserRole (отдельная модель):** user, role_type (EMPLOYEE, CANDIDATE, INTERVIEWER, ADMIN), context, context_id.

---

### 2.2 Что есть на фронте (UsersSettings)

| Поле | Есть | Комментарий |
|------|------|-------------|
| `email` | ✅ | |
| `first_name`, `last_name` | ✅ | |
| `position` | ✅ | Строка, не FK |
| `groups` | ✅ | Массив строк (группы) |
| `is_active` | ✅ | |
| `last_login` | ✅ | |
| `created_at` | ✅ | |
| `access` | ✅ | UserAccessModal (права) |

**Нет:** employee_id, phone, lifecycle_state, department, position (FK), manager, location, timezone, hire_date, probation_end_date, contract_end_date, separation_date, is_interviewer, avatar, custom_attributes, UserRole.

---

### 2.3 План доработки UserSettings

#### Карточка пользователя (список + форма редактирования)

**Блок «Идентификация»**

- [ ] `employee_id` — табельный номер (опционально)
- [ ] `first_name`, `last_name` — уже есть
- [ ] `email` — уже есть
- [ ] `phone` — телефон
- [ ] `avatar` — загрузка аватара

**Блок «Трудоустройство»**

- [ ] `lifecycle_state` — StateBadge + StateTransitionButton (FSM)
- [ ] `department` — Select (FK Department)
- [ ] `position` — Select (FK Position)
- [ ] `manager` — Select (FK User)
- [ ] `location` — Select (FK Location / Office)
- [ ] `timezone` — Select (IANA)
- [ ] `is_interviewer` — Checkbox

**Блок «Даты»**

- [ ] `hire_date` — DatePicker
- [ ] `probation_end_date` — DatePicker
- [ ] `contract_end_date` — DatePicker
- [ ] `separation_date` — DatePicker

**Блок «Роли и доступ»**

- [ ] UserRole — связь с моделью ролей (role_type, context, context_id)
- [ ] Интеграция с текущим `groups` или замена на UserRole
- [ ] `is_active` — Switch (уже есть на фронте, оставить)
- [ ] `username` — для логина (если отличается от email)
- [ ] `date_joined`, `last_login` — read-only (уже есть)

**Custom Attributes**

- [ ] Блок «Дополнительные поля» — CustomAttributesEditor по схеме для User

---

## 3. Зависимости между блоками

| CompanySettings | UserSettings |
|-----------------|--------------|
| Department, Location — справочники компании | User выбирает department, location из справочников компании |
| probation_period_days, notice_period_days — дефолты для расчёта дат пользователя | hire_date + probation_period_days → probation_end_date (подсказка) |
| timezone — дефолт для компании | User.timezone может переопределять |

---

## 4. API (ожидаемые endpoints)

### Company

- `GET /api/company/` — текущая компания
- `PATCH /api/company/` — обновление
- `GET /api/company/offices/` или `GET /api/company/locations/` — офисы/локации
- `POST/PATCH/DELETE /api/company/offices/` — CRUD офисов

### User

- `GET /api/users/` — список (с фильтрами)
- `GET /api/users/:id/` — карточка
- `POST /api/users/` — создание
- `PATCH /api/users/:id/` — обновление
- `POST /api/users/:id/transition/` — FSM-переход (lifecycle_state)

### Справочники (для Select)

- `GET /api/departments/` — отделы
- `GET /api/positions/` — должности
- `GET /api/locations/` — локации
- `GET /api/users/?role=manager` — для выбора manager

---

## 5. Приоритет реализации

| # | Задача | Блок | Сложность |
|---|--------|------|-----------|
| 1 | Добавить поля Company (legal_name, tax_id, headquarters, timezone, industry, company_size, HR-параметры) | CompanySettings | Средняя |
| 2 | Добавить поля User (employee_id, phone, department, position, manager, location, dates, is_interviewer) | UserSettings | Средняя |
| 3 | Интеграция Department, Position, Location (справочники) | Оба | Зависит от API |
| 4 | lifecycle_state + FSM (StateBadge, кнопки переходов) | UserSettings | Высокая |
| 5 | CustomAttributesEditor для Company и User | Оба | Средняя |
| 6 | UserRole вместо/вместе с groups | UserSettings | Уточнить |
