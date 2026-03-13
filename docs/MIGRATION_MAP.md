# Migration Map: frontend old → frontend

Документ описывает соответствие компонентов и страниц между старым (`frontend old/`) и новым (`frontend/`) фронтендом.

## Статус миграции

| Статус | Описание |
|--------|----------|
| ✅ | Полностью мигрировано |
| 🔄 | Частично мигрировано |
| ❌ | Не мигрировано |
| 🆕 | Новый функционал в FSD |

---

## Страницы (App Routes)

### Авторизация и профиль

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/account/login/` | `app/router/routes/auth/` | ✅ |
| `app/account/profile/` | `app/router/routes/profile/` | ✅ |
| `app/account/forgot-password/` | `features/auth/` | ✅ |
| `app/account/reset-password/` | `features/auth/` | ✅ |

### Рекрутинг

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/vacancies/` | `app/router/routes/vacancies/` | ✅ |
| `app/vacancies/[id]/` | `app/router/routes/vacancies/` | ✅ |
| `app/vacancies/salary-ranges/` | `features/compensation/` | ✅ |
| `app/vacancies/requests/` | `features/recruiting/hiring-requests/` | ✅ |
| `app/candidate-responses/` | `features/recruiting/candidate-responses/` | ✅ |
| `app/invites/` | `features/recruiting/invites/` | ✅ |
| `app/invites/[id]/` | `features/recruiting/invites/` | ✅ |
| `app/hiring-requests/` | `features/recruiting/hiring-requests/` | ✅ |
| `app/interviewers/` | `features/recruiting/interviewers/` | ✅ |
| `app/ats/` | `features/ai/ats/` | ✅ |
| `app/ats/vacancy/` | `features/ai/ats/` | ✅ |
| `app/huntflow/` | `features/recruiting/huntflow/` | ✅ |

### Wiki и документация

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/wiki/` | `app/router/routes/wiki/` | ✅ |
| `app/wiki/[id]/` | `app/router/routes/wiki/` | ✅ |

### Аналитика и отчётность

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/reporting/` | `features/reporting/` | ✅ |
| `app/reporting/hiring-plan/` | `features/reporting/` | ✅ |
| `app/reporting/company/` | `features/reporting/` | ✅ |

### Финансы

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/finance/` | `features/finance/` | ✅ |
| `app/finance/benchmarks/` | `features/finance/benchmarks/` | ✅ |

### Настройки компании

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/company-settings/` | `app/router/routes/company-settings/` | ✅ |
| `app/company-settings/vacancy-prompt/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/employee-lifecycle/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/grades/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/hiring-stages/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/candidate-fields/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/org-structure/` | `features/organization/` | ✅ |
| `app/company-settings/user-groups/` | `app/router/routes/company-settings/` | ✅ |
| `app/company-settings/integrations/` | `features/integrations/` | ✅ |
| `app/company-settings/users/` | `app/router/routes/company-settings/` | ✅ |
| `app/company-settings/finance/` | `features/finance/` | ✅ |
| `app/company-settings/sla/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/scorecard/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/rating-scales/` | `shared/components/company-settings/` | ✅ |
| `app/company-settings/recruiting/` | `app/router/routes/company-settings/` | ✅ |
| `app/company-settings/rejection-reasons/` | `shared/components/company-settings/` | ✅ |

### Прочее

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/projects/` | `features/projects/` | ✅ |
| `app/projects/[id]/` | `features/projects/` | ✅ |
| `app/projects/resources/` | `features/projects/` | ✅ |
| `app/projects/teams/` | `features/projects/` | ✅ |
| `app/specializations/` | `features/specializations/` | ✅ |
| `app/specializations/[id]/` | `features/specializations/` | ✅ |
| `app/workflow/` | `features/workflow/` | ✅ |
| `app/telegram/` | `features/integrations/` | ✅ |
| `app/telegram/2fa/` | `features/integrations/` | ✅ |
| `app/telegram/chats/` | `features/integrations/` | ✅ |
| `app/aichat/` | `features/ai/` | ✅ |
| `app/calendar/` | `shared/components/calendar/` | ✅ |
| `app/search/` | `shared/components/navigation/GlobalSearch/` | ✅ |

### Админка

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/admin/` | `app/router/routes/admin/` | ✅ |
| `app/admin/users/` | `app/router/routes/admin/` | ✅ |
| `app/admin/groups/` | `app/router/routes/admin/` | ✅ |
| `app/admin-crm/` | `app/router/routes/admin/` | ✅ |

### Ошибки

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `app/errors/401/` | `app/router/routes/errors/` | ✅ |
| `app/errors/402/` | `app/router/routes/errors/` | ✅ |
| `app/errors/403/` (forbidden) | `app/router/routes/errors/` | ✅ |
| `app/errors/404/` | `app/router/routes/errors/` | ✅ |
| `app/errors/500/` | `app/router/routes/errors/` | ✅ |
| `app/not-found/` | `app/router/routes/errors/` | ✅ |

---

## Компоненты

### Layout компоненты

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `components/AppLayout.tsx` | `app/router/layouts/MainLayout.tsx` | ✅ |
| `components/Sidebar.tsx` | `shared/components/navigation/Sidebar/` | ✅ |
| `components/Header.tsx` | `shared/components/navigation/Header/` | ✅ |
| `components/StatusBar.tsx` | `shared/components/layout/StatusBar/` | ✅ |
| `components/FloatingActions.tsx` | `shared/components/navigation/FloatingActions/` | ✅ |

### UI компоненты

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `components/Toast/` | `shared/components/feedback/Toast/` | ✅ |
| `components/FloatingLabelInput.tsx` | `shared/components/ui/Input/` | ✅ |
| — | `shared/components/ui/Button/` | 🆕 |
| — | `shared/components/ui/Dialog/` | 🆕 |
| — | `shared/components/ui/Select/` | 🆕 |
| — | `shared/components/ui/Tabs/` | 🆕 |
| — | `shared/components/ui/Popover/` | 🆕 |

### Компоненты настроек компании

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `components/company-settings/GradeForm.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/RecruitingStagesSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/RatingScalesSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/GradesSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/VacancyPromptSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/ScorecardSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/SLASettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/SLAEditModal.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/GeneralSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/EmployeeLifecycleSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/RecruitingCommandsSettings.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/UserAccessModal.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/GroupAccessModal.tsx` | `shared/components/company-settings/` | ✅ |
| `components/company-settings/CandidateFieldsSettings.tsx` | `shared/components/company-settings/` | ✅ |

### Компоненты вакансий и зарплат

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `components/salary-ranges/` | `features/compensation/` | ✅ |
| `components/vacancies/` | `features/recruiting/vacancies/` | ✅ |

### Wiki компоненты

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `components/wiki/WikiHeader.tsx` | `shared/components/wiki/` | ✅ |
| `components/wiki/WikiCard.tsx` | `shared/components/wiki/` | ✅ |
| `components/wiki/WikiTagSelector.tsx` | `shared/components/wiki/` | ✅ |
| `components/wiki/WikiDeleteConfirmDialog.tsx` | `shared/components/wiki/` | ✅ |
| `components/wiki/WikiCategory.tsx` | `shared/components/wiki/` | ✅ |
| `components/wiki/WikiDetailContent.tsx` | `shared/components/wiki/` | ✅ |
| `components/wiki/WikiFilters.tsx` | `shared/components/wiki/` | ✅ |

---

## Entities (бизнес-сущности)

| Сущность | Расположение | Статус |
|----------|--------------|--------|
| User | `entities/user/` | ✅ |
| Candidate | `entities/candidate/` | ✅ |
| Employee | `entities/employee/` | ✅ |
| Department | `entities/department/` | ✅ |
| Team | `entities/team/` | ✅ |
| Job | `entities/job/` | ✅ |
| Vacancy | `entities/vacancy/` | ✅ |
| Company | `entities/company/` | ✅ |

---

## Общие утилиты и хуки

| Старый путь | Новый путь | Статус |
|-------------|------------|--------|
| `lib/api.ts` | `shared/api/` | ✅ |
| `lib/utils.ts` | `shared/utils/`, `shared/lib/` | ✅ |
| `hooks/` | `shared/hooks/` | ✅ |
| `contexts/` | `app/providers/`, `shared/stores/` | ✅ |

---

## Что требует внимания

### Приоритет 1: Тесты

- Покрыть unit-тестами `shared/lib/`
- Добавить тесты для entities models
- Integration тесты для критических features

### Приоритет 2: Документация

- Документировать API методы
- Создать Storybook для UI компонентов

---

**Последнее обновление:** Март 2026
