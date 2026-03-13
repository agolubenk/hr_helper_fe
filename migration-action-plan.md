# План миграции на FSD архитектуру

## 🎯 Цель
Поэтапная миграция HR Helper Frontend с классической архитектуры на Feature-Sliced Design для улучшения масштабируемости, поддерживаемости и структуры кода.

---

## 📋 Фазы миграции

### Фаза 0: Подготовка (1-2 дня)

#### 0.1. Создание базовой структуры FSD
```bash
frontend/src/
  ├── app/           # Инициализация приложения
  ├── processes/     # Сложные бизнес-процессы
  ├── pages/         # Страницы приложения
  ├── widgets/       # Комплексные UI блоки
  ├── features/      # Функциональные возможности
  ├── entities/      # Бизнес-сущности
  └── shared/        # Переиспользуемый код
```

**Действия:**
- [x] Создать директории всех слоев FSD
- [x] Настроить алиасы в `tsconfig.json` для импортов (используется единый алиас `@/*` → `./src/*` согласно core-standards.mdc)
- [x] Настроить алиасы в `vite.config.ts`
- [x] Обновить ESLint с правилами импорта между слоями FSD (eslint.config.js)
- [x] Создать `README.md` с описанием архитектуры и правилами

#### 0.2. Документирование текущей архитектуры
- [x] Проанализировать существующие компоненты в `frontend old/components/`
- [x] Составить карту зависимостей между компонентами (см. docs/migration_guide.md)
- [x] Определить кандидатов для каждого слоя FSD (см. docs/migration_guide.md)
- [x] Создать mapping-файл `MIGRATION_MAP.md` (см. docs/MIGRATION_MAP.md)

---

### Фаза 1: Shared Layer (2-3 дня)

#### 1.1. Миграция UI Kit компонентов
**Приоритет: Высокий** | **Зависимости: Нет**

**Компоненты для переноса:**
- `FloatingLabelInput.tsx` → `shared/ui/FloatingLabelInput/`
- UI компоненты из `Toast/` → `shared/ui/Toast/`
- Generic form components

**Структура:**
```
shared/
  ├── ui/
  │   ├── FloatingLabelInput/
  │   │   ├── ui.tsx
  │   │   ├── model.ts
  │   │   ├── index.ts
  │   │   └── styles.module.css
  │   ├── Toast/
  │   └── Button/
```

**Чеклист:**
- [x] Создать структуру `shared/ui/` (реализовано как `shared/components/ui/`)
- [x] Перенести `FloatingLabelInput` с тестами (Input компонент создан)
- [x] Перенести Toast систему (реализовано в `shared/components/feedback/Toast/`)
- [x] Создать барелл-экспорты (`index.ts`)
- [x] Обновить импорты в компонентах, которые их используют
- [x] Проверить работоспособность UI Kit

#### 1.2. Миграция утилит и хелперов
**Приоритет: Высокий** | **Зависимости: 1.1**

**Компоненты для переноса:**
```
shared/
  ├── lib/
  │   ├── react/          # React хуки и утилиты
  │   ├── formatters/     # Форматирование данных
  │   ├── validators/     # Валидация
  │   └── date/           # Работа с датами
  ├── hooks/
  │   ├── useDebounce/
  │   ├── useLocalStorage/
  │   └── useClickOutside/
```

**Чеклист:**
- [x] Извлечь все переиспользуемые функции из компонентов
- [x] Создать структуру `shared/lib/`
- [x] Перенести React хуки в `shared/hooks/`
- [x] Покрыть утилиты unit-тестами (string, array, date, useDebounce, useToggle)
- [x] Обновить импорты

#### 1.3. API клиент и типы
**Приоритет: Критический** | **Зависимости: 1.2**

```
shared/
  ├── api/
  │   ├── base.ts         # Базовый API клиент
  │   ├── interceptors.ts # Axios interceptors
  │   └── index.ts
  ├── types/
  │   ├── user.ts
  │   ├── vacancy.ts
  │   └── candidate.ts
  └── config/
      ├── routes.ts       # Константы роутов
      └── constants.ts    # Общие константы
```

**Чеклист:**
- [x] Создать базовую структуру API
- [x] Перенести типы из старых компонентов (реализовано в `shared/types/`)
- [x] Настроить axios instance с interceptors (реализовано в `shared/api/interceptors/`)
- [x] Создать единый набор типов для всего приложения
- [x] Документировать API методы (shared/api/README.md)

---

### Фаза 2: Entities Layer (3-4 дня)

#### 2.1. Создание базовых сущностей
**Приоритет: Критический** | **Зависимости: Фаза 1**

**Структура:**
```
entities/
  ├── user/
  │   ├── model/          # Store, actions, selectors
  │   ├── api/            # API методы для user
  │   ├── ui/             # UI компоненты (UserCard, Avatar)
  │   └── lib/            # Вспомогательные функции
  ├── vacancy/
  │   ├── model/
  │   ├── api/
  │   ├── ui/             # VacancyCard, VacancyStatus
  │   └── lib/
  ├── candidate/
  └── company/
```

**Чеклист:**
- [x] Создать структуру `entities/user/`
- [x] Перенести логику работы с пользователем из `profile/`
- [x] Создать Zustand store для user entity (альтернатива: model.ts + api.ts)
- [x] Реализовать API слой для user
- [x] Повторить для candidate, employee, department, team, job
- [x] Создать entity vacancy (entities/vacancy/)
- [x] Создать entity company (entities/company/)
- [x] Написать тесты для моделей (entities/vacancy/__tests__/, entities/company/__tests__/)

#### 2.2. Миграция UI компонентов сущностей
**Приоритет: Высокий** | **Зависимости: 2.1**

**Компоненты:**
- Из `vacancies/` → `entities/vacancy/ui/`
- Из `profile/` → `entities/user/ui/`
- Карточки кандидатов → `entities/candidate/ui/`

**Чеклист:**
- [ ] Перенести VacancyCard компоненты (в entities/vacancy/ui/)
- [x] Перенести UserProfile компоненты (в entities/user/ui/)
- [x] Перенести CandidateCard компоненты (в entities/candidate/ui/)
- [x] Рефакторинг компонентов под новую архитектуру
- [x] Обновить пропсы и типы
- [x] Проверить отображение в интерфейсе

---

### Фаза 3: Features Layer (4-5 дней)

#### 3.1. Авторизация и аутентификация
**Приоритет: Критический** | **Зависимости: 2.1**

```
features/
  └── auth/
      ├── login/
      │   ├── ui/
      │   ├── model/
      │   └── api/
      ├── register/
      └── logout/
```

**Чеклист:**
- [x] Создать feature структуру auth
- [x] Перенести логику логина (в features/auth/components/LoginForm.tsx)
- [x] Перенести логику регистрации
- [x] Настроить auth store (в features/auth/hooks/, features/auth/api/)
- [x] Реализовать protected routes (в app/router/guards/)
- [x] Добавить middleware для проверки авторизации

#### 3.2. Управление вакансиями
**Приоритет: Высокий** | **Зависимости: 2.2**

```
features/
  ├── vacancy-create/
  ├── vacancy-edit/
  ├── vacancy-delete/
  ├── vacancy-publish/
  └── vacancy-search/
```

**Чеклист:**
- [x] Создать feature создания вакансии (в features/recruiting/vacancies/)
- [x] Создать feature редактирования
- [x] Реализовать поиск и фильтрацию (в features/recruiting/vacancies/components/)
- [x] Добавить функционал публикации/архивирования
- [ ] Интегрировать с entities/vacancy (entity vacancy пока не создан)

#### 3.3. Работа с кандидатами
**Приоритет: Высокий** | **Зависимости: 2.2**

```
features/
  ├── candidate-add/
  ├── candidate-edit/
  ├── candidate-response-view/
  ├── candidate-status-change/
  └── candidate-invite/
```

**Чеклист:**
- [x] Перенести логику добавления кандидата (в features/recruiting/components/candidates/)
- [x] Реализовать смену статуса кандидата
- [x] Создать feature просмотра откликов (в features/recruiting/candidate-responses/)
- [x] Добавить функционал приглашения на интервью (в features/recruiting/invites/)
- [x] Интегрировать с Telegram/Email уведомлениями (в features/notifications/)

#### 3.4. Другие фичи
**Приоритет: Средний**

```
features/
  ├── global-search/          # Из GlobalSearch/
  ├── theme-switcher/         # Из ThemeProvider
  ├── ai-chat/                # Из aichat/
  ├── finance-tracker/        # Из finance/
  └── wiki-editor/            # Из wiki/
```

**Чеклист:**
- [x] Перенести глобальный поиск (в shared/components/navigation/GlobalSearch/)
- [x] Рефакторинг переключателя темы (в app/providers/)
- [x] Мигрировать AI chat функционал (в features/ai/)
- [x] Перенести financial features (в features/finance/)
- [x] Мигрировать wiki систему (в shared/components/wiki/ и app/router/routes/wiki/)

---

### Фаза 4: Widgets Layer (3-4 дня)

#### 4.1. Layout компоненты
**Приоритет: Критический** | **Зависимости: Фаза 3**

```
widgets/
  ├── Header/
  │   ├── ui/
  │   ├── model/
  │   └── index.ts
  ├── Sidebar/
  ├── StatusBar/
  └── FloatingActions/
```

**Чеклист:**
- [x] Перенести `Header.tsx` → `shared/components/navigation/Header/` (альтернативная структура)
- [x] Перенести `Sidebar.tsx` → `shared/components/navigation/Sidebar/`
- [x] Перенести `StatusBar.tsx` → `shared/components/layout/StatusBar/`
- [x] Перенести `FloatingActions.tsx` → `shared/components/navigation/FloatingActions/`
- [x] Рефакторинг для использования features
- [x] Обновить стили и адаптивность

#### 4.2. Комплексные виджеты
**Приоритет: Высокий** | **Зависимости: 4.1**

```
widgets/
  ├── VacancyList/            # Список вакансий с фильтрами
  ├── CandidateBoard/         # Kanban-доска кандидатов
  ├── DashboardStats/         # Статистика для дашборда
  └── NotificationCenter/     # Центр уведомлений
```

**Чеклист:**
- [x] Создать виджет списка вакансий (в features/recruiting/vacancies/components/)
- [x] Реализовать Kanban-доску кандидатов (в shared/components/data-display/KanbanBoard/)
- [x] Создать dashboard со статистикой (в features/reporting/)
- [x] Добавить центр уведомлений (в features/notifications/)
- [x] Интегрировать с features и entities

---

### Фаза 5: Pages Layer (2-3 дня)

#### 5.1. Основные страницы
**Приоритет: Критический** | **Зависимости: Фаза 4**

```
pages/
  ├── home/
  ├── vacancies/
  │   ├── ui/
  │   │   ├── VacanciesPage.tsx
  │   │   ├── VacancyDetailPage.tsx
  │   │   └── VacancyCreatePage.tsx
  │   └── index.ts
  ├── candidates/
  ├── profile/
  ├── company-settings/
  └── auth/
```

**Чеклист:**
- [x] Создать структуру страниц (в app/router/routes/)
- [x] Композировать страницы из features и компонентов
- [x] Настроить routing (TanStack Router в app/router/index.tsx)
- [x] Добавить lazy loading для страниц
- [ ] Настроить SEO meta tags
- [x] Добавить breadcrumbs навигацию (в shared/components/navigation/Breadcrumbs/)

#### 5.2. Специализированные страницы
**Приоритет: Средний**

```
pages/
  ├── requests/               # Заявки на закрытие
  ├── salary-ranges/          # Salary calculator
  ├── finance/                # Financial dashboard
  ├── wiki/                   # Internal wiki
  └── telegram-settings/      # Telegram integration
```

**Чеклист:**
- [x] Мигрировать страницу заявок (в features/recruiting/hiring-requests/)
- [x] Перенести salary calculator (в features/compensation/)
- [x] Создать financial dashboard (в features/finance/)
- [x] Мигрировать wiki страницу (в app/router/routes/wiki/)
- [x] Настроить Telegram integration UI (в features/integrations/)

---

### Фаза 6: Processes Layer (2 дня)

#### 6.1. Бизнес-процессы
**Приоритет: Средний** | **Зависимости: Фаза 5**

```
processes/
  ├── candidate-hiring-flow/
  │   ├── model/              # Orchestration logic
  │   ├── ui/                 # Wizard components
  │   └── config/             # Workflow configuration
  ├── vacancy-closing-flow/
  └── onboarding-flow/
```

**Чеклист:**
- [x] Выделить сложные бизнес-процессы (реализовано в features/workflow/)
- [x] Создать orchestration логику для найма (в features/recruiting/)
- [x] Реализовать workflow для закрытия вакансий (в features/workflow/)
- [x] Добавить onboarding flow для новых пользователей (в features/onboarding/)
- [x] Интегрировать с features и pages

---

### Фаза 7: App Layer (1-2 дня)

#### 7.1. Инициализация приложения
**Приоритет: Критический** | **Зависимости: Все предыдущие**

```
app/
  ├── providers/
  │   ├── RouterProvider.tsx
  │   ├── StoreProvider.tsx
  │   ├── ThemeProvider.tsx
  │   └── ToastProvider.tsx
  ├── routes/
  │   ├── index.tsx
  │   ├── ProtectedRoute.tsx
  │   └── config.ts
  ├── styles/
  │   ├── globals.css
  │   └── reset.css
  └── index.tsx
```

**Чеклист:**
- [x] Перенести `AppLayout.tsx` логику (в app/router/layouts/)
- [x] Настроить провайдеры (Router, Store, Theme) (в app/providers/)
- [x] Конфигурация роутинга (в app/router/index.tsx)
- [x] Global styles и CSS variables (в shared/styles/)
- [ ] Error boundaries (частично реализовано в shared/components/business/ErrorBoundary/)
- [x] Loading states (в shared/components/business/LoadingState/)

#### 7.2. Глобальные сервисы
**Приоритет: Высокий**

```
app/
  ├── services/
  │   ├── analytics/
  │   ├── monitoring/
  │   └── i18n/
  └── config/
      ├── environment.ts
      └── feature-flags.ts
```

**Чеклист:**
- [x] Настроить analytics (в features/analytics/)
- [ ] Добавить error monitoring (Sentry)
- [x] Конфигурация i18n для мультиязычности (в app/providers/I18nProvider.tsx, shared/lib/i18n.ts)
- [x] Feature flags система (shared/lib/feature-flags/, app/providers/FeatureFlagsProvider.tsx)
- [x] Environment configuration (Vite environment)

---

### Фаза 8: Финализация и тестирование (3-4 дня)

#### 8.1. Рефакторинг и оптимизация
**Приоритет: Высокий**

**Чеклист:**
- [ ] Устранить дублирование кода
- [x] Оптимизировать импорты (tree-shaking — Vite поддерживает из коробки)
- [x] Проверить bundle size (vite-plugin-visualizer, npm run build:analyze)
- [x] Оптимизировать ре-рендеры (React.memo для VacancyCard, shared/lib/memo.ts)
- [x] Code splitting для routes (shared/lib/lazy.tsx, app/router/lazy-routes.ts)
- [x] Lazy loading компонентов (lazyLoad, lazyLoadNamed utilities)

#### 8.2. Тестирование
**Приоритет: Критический**

**Чеклист:**
- [x] Unit тесты для shared/lib (utils/string, utils/array, utils/date)
- [x] Тесты для entities models (vacancy, company API и UI)
- [x] Тесты для hooks (useDebounce, useToggle)
- [x] Integration тесты для features (VacanciesPage, FeatureFlags)
- [ ] E2E тесты для критических сценариев
- [ ] Тестирование доступности (a11y)
- [ ] Cross-browser тестирование

#### 8.3. Документация
**Приоритет: Высокий**

**Чеклист:**
- [x] Обновить README.md с архитектурой (frontend/README.md)
- [x] Документировать каждый слой FSD (frontend/README.md)
- [x] Создать гайд для разработчиков (docs/DEVELOPER_GUIDE.md)
- [x] Storybook для UI компонентов (.storybook/, stories для Vacancy, Company)
- [x] API документация (shared/api/README.md)
- [x] Схемы взаимодействия модулей (docs/ARCHITECTURE.md)

#### 8.4. Удаление старого кода
**Приоритет: Средний**

**Чеклист:**
- [x] Убедиться, что весь код мигрирован (см. docs/MIGRATION_MAP.md)
- [ ] Удалить `frontend old/` (после полной верификации)
- [ ] Очистить неиспользуемые зависимости
- [x] Обновить `.gitignore` (добавлены Storybook, coverage, bundle analysis)
- [ ] Создать архив старого кода (git tag)

---

## 📊 Метрики успеха

### Технические метрики
- [ ] Bundle size уменьшен на 20%+
- [ ] Время холодного старта < 2 сек
- [ ] Code coverage > 70%
- [ ] Lighthouse score > 90
- [ ] Zero circular dependencies
- [ ] TypeScript strict mode enabled

### Качество кода
- [ ] Все слои FSD изолированы
- [ ] Правила импортов соблюдены (eslint)
- [ ] Нет дублирования кода (DRY)
- [ ] Консистентная структура файлов
- [ ] Все компоненты типизированы

### Документация
- [ ] Архитектура документирована
- [ ] Каждый модуль имеет README
- [ ] Storybook stories для 80%+ UI
- [ ] API endpoints документированы
- [ ] Migration guide создан

---

## 🚨 Риски и митигация

### Риск 1: Сломанный функционал
**Вероятность:** Высокая  
**Митигация:**
- Поэтапная миграция с тестированием каждой фазы
- Feature flags для постепенного rollout
- Сохранение старого кода до полной миграции
- E2E тесты перед каждым merge

### Риск 2: Увеличение времени разработки
**Вероятность:** Средняя  
**Митигация:**
- Детальный план с оценками времени
- Параллельная работа над независимыми модулями
- Использование code generation (Plop.js)
- Pair programming для сложных участков

### Риск 3: Конфликты при merge
**Вероятность:** Высокая  
**Митигация:**
- Работа в отдельной ветке `fsd-migration`
- Частые rebase с main
- Атомарные коммиты
- Детальные commit messages

### Риск 4: Потеря производительности
**Вероятность:** Низкая  
**Митигация:**
- Benchmark тесты до и после
- Профилирование React компонентов
- Оптимизация bundle size
- Code splitting агрессивное

---

## 📅 Временная оценка

| Фаза | Описание | Время | Зависимости |
|------|----------|-------|-------------|
| **Фаза 0** | Подготовка | 1-2 дня | - |
| **Фаза 1** | Shared Layer | 2-3 дня | Фаза 0 |
| **Фаза 2** | Entities Layer | 3-4 дня | Фаза 1 |
| **Фаза 3** | Features Layer | 4-5 дней | Фаза 2 |
| **Фаза 4** | Widgets Layer | 3-4 дня | Фаза 3 |
| **Фаза 5** | Pages Layer | 2-3 дня | Фаза 4 |
| **Фаза 6** | Processes Layer | 2 дня | Фаза 5 |
| **Фаза 7** | App Layer | 1-2 дня | Все |
| **Фаза 8** | Финализация | 3-4 дня | Фаза 7 |

**Общая оценка:** 21-29 рабочих дней (4-6 недель)

---

## 🛠️ Инструменты и скрипты

### Автоматизация создания структуры
```bash
# Plop.js templates для генерации FSD модулей
npm run generate:entity
npm run generate:feature
npm run generate:widget
npm run generate:page
```

### Проверка архитектуры
```bash
# ESLint plugin для FSD
npm run lint:fsd

# Dependency cruiser для проверки графа зависимостей
npm run check:dependencies

# Bundle analyzer
npm run analyze:bundle
```

### CI/CD
```yaml
# GitHub Actions pipeline
- Lint & Type check
- Unit tests
- Integration tests
- E2E tests (Cypress/Playwright)
- Bundle size check
- Deployment preview
```

---

## 📝 Следующие шаги

1. **Создать feature ветку**
   ```bash
   git checkout -b fsd-migration
   ```

2. **Начать с Фазы 0**
   - Создать базовую структуру директорий
   - Настроить алиасы и правила ESLint

3. **Еженедельные ревью**
   - Показывать прогресс команде
   - Собирать feedback
   - Корректировать план

4. **Документировать изменения**
   - Вести changelog
   - Обновлять диаграммы архитектуры
   - Писать migration notes

---

## 🔗 Полезные ресурсы

- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [FSD Examples Repository](https://github.com/feature-sliced/examples)
- [Awesome FSD](https://github.com/feature-sliced/awesome)
- [ESLint Plugin FSD](https://github.com/feature-sliced/eslint-config)

---

**Автор плана:** AI Assistant  
**Дата создания:** 13 марта 2026  
**Версия:** 1.0  
**Статус:** Готов к исполнению