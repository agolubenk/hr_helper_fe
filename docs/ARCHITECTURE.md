# Архитектура HR Platform Frontend

## Обзор

HR Platform Frontend построен на основе адаптированной Feature-Sliced Design (FSD) архитектуры с использованием современного стека React.

## Стек технологий

| Категория | Технология |
|-----------|------------|
| UI-фреймворк | React 18 |
| Язык | TypeScript (strict mode) |
| Роутинг | TanStack Router |
| Серверное состояние | TanStack React Query |
| Клиентское состояние | Zustand |
| UI-библиотека | Radix UI Themes |
| Сборщик | Vite |
| Тестирование | Vitest + React Testing Library |
| Документация | Storybook |

## Структура слоёв

```
src/
├── app/                    # Слой приложения
│   ├── providers/          # Провайдеры (Theme, FeatureFlags)
│   ├── router/             # TanStack Router конфигурация
│   └── styles/             # Глобальные стили
├── features/               # Бизнес-фичи
│   ├── recruiting/         # Рекрутинг модуль
│   │   ├── vacancies/      # Управление вакансиями
│   │   ├── candidates/     # Управление кандидатами
│   │   └── ats/            # ATS система
│   ├── auth/               # Аутентификация
│   └── settings/           # Настройки
├── entities/               # Бизнес-сущности
│   ├── vacancy/            # Вакансия
│   ├── company/            # Компания
│   └── user/               # Пользователь
└── shared/                 # Переиспользуемые модули
    ├── api/                # API клиент
    ├── components/         # UI компоненты
    ├── hooks/              # Общие хуки
    ├── lib/                # Библиотеки (feature-flags, lazy)
    ├── utils/              # Утилиты
    └── types/              # Общие типы
```

## Схема зависимостей

```
┌─────────────────────────────────────────────────────────────┐
│                          APP                                 │
│  (providers, router, global styles)                         │
├─────────────────────────────────────────────────────────────┤
│                        FEATURES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  recruiting  │  │    auth      │  │   settings   │      │
│  │  ├─vacancies │  │              │  │              │      │
│  │  ├─candidates│  │              │  │              │      │
│  │  └─ats       │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                        ENTITIES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   vacancy    │  │   company    │  │    user      │      │
│  │  ├─model     │  │  ├─model     │  │  ├─model     │      │
│  │  ├─api       │  │  ├─api       │  │  ├─api       │      │
│  │  └─ui        │  │  └─ui        │  │  └─ui        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                         SHARED                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │   api   │ │components│ │  hooks  │ │  utils  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐                                    │
│  │   lib   │ │  types  │                                    │
│  └─────────┘ └─────────┘                                    │
└─────────────────────────────────────────────────────────────┘

Направление зависимостей: ↓ (сверху вниз)
- app → features → entities → shared
- Слой НЕ импортирует из слоёв выше
```

## Правила импортов

```
shared/  ← НЕ импортирует из entities, features, app
entities/ ← импортирует только из shared
features/ ← импортирует из shared, entities
app/      ← импортирует из shared, entities, features
```

Эти правила enforced через ESLint (`no-restricted-imports`).

## Потоки данных

### Серверное состояние (TanStack Query)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Feature   │───▶│   Entity    │───▶│  Mock API   │
│  Component  │    │    API      │    │  (Promise)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                 │
       │                 ▼
       │          ┌─────────────┐
       └─────────▶│  useQuery   │
                  │ useMutation │
                  └─────────────┘
```

### Клиентское состояние (Zustand)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Feature   │───▶│   Zustand   │───▶│    Store    │
│  Component  │    │    Hook     │    │   (slice)   │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Entity структура

Каждая entity имеет стандартную структуру:

```
entity/
├── model.ts          # Типы и интерфейсы
├── api.ts            # API методы (mock)
├── ui/               # UI компоненты
│   ├── EntityCard.tsx
│   └── EntityBadge.tsx
├── __tests__/        # Тесты
└── index.ts          # Public API (barrel export)
```

## Feature структура

```
feature/
├── components/       # Компоненты фичи
├── hooks/            # Хуки фичи
├── mocks.ts          # Мок-данные
├── types.ts          # Типы фичи
├── FeaturePage.tsx   # Главная страница
└── index.ts          # Public API
```

## Оптимизации

### Bundle Splitting

```javascript
// vite.config.ts
manualChunks: {
  vendor: ['react', 'react-dom'],
  radix: ['@radix-ui/themes'],
  router: ['@tanstack/react-router'],
  query: ['@tanstack/react-query'],
  editor: ['@tiptap/react', '@tiptap/starter-kit'],
}
```

### Lazy Loading

```typescript
// shared/lib/lazy.tsx
import { lazyLoadNamed } from '@/shared/lib/lazy'

const VacanciesPage = lazyLoadNamed(
  () => import('@/features/recruiting/vacancies'),
  'VacanciesPage'
)
```

### Мемоизация

```typescript
// shared/lib/memo.ts
import { typedMemo, withMemo } from '@/shared/lib/memo'

export const VacancyCard = memo(function VacancyCard(props) {
  // ...
})
```

## Feature Flags

```typescript
// Использование
import { useFeatureFlag, FeatureFlag } from '@/shared/lib/feature-flags'

const isEnabled = useFeatureFlag('dark_mode')

<FeatureFlag flag="new_feature">
  <NewFeatureComponent />
</FeatureFlag>
```

## Тестирование

### Unit тесты

```bash
npm run test              # watch mode
npm run test:run          # single run
npm run test:coverage     # с покрытием
```

### Storybook

```bash
npm run storybook         # dev сервер
npm run build-storybook   # сборка
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev сервера |
| `npm run build` | Production сборка |
| `npm run build:analyze` | Сборка + анализ bundle |
| `npm run test` | Запуск тестов |
| `npm run lint` | Линтинг |
| `npm run storybook` | Storybook dev |

## Полезные ссылки

- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Radix UI](https://www.radix-ui.com/)
- [Vitest](https://vitest.dev/)
- [Storybook](https://storybook.js.org/)
