# HR Helper Frontend

Современное React-приложение для управления HR-процессами, построенное на базе Feature-Sliced Design (FSD) архитектуры.

## Технологический стек

| Категория | Технология |
|-----------|------------|
| UI-фреймворк | React 18 (функциональные компоненты + хуки) |
| Язык | TypeScript (strict mode) |
| Роутинг | TanStack Router |
| Стейт-менеджмент | Zustand + TanStack React Query |
| UI-библиотека | Radix UI Primitives |
| Сборщик | Vite |
| Тестирование | Vitest + React Testing Library |
| Стили | CSS Modules |

## Структура проекта

```
src/
├── app/                          # Инициализация приложения
│   ├── providers/                # Провайдеры (Theme, I18n, etc.)
│   ├── router/                   # Конфигурация роутинга
│   │   ├── guards/               # Route guards (auth, permissions)
│   │   ├── layouts/              # Layout компоненты (Main, Admin, Root)
│   │   └── routes/               # Страницы приложения
│   └── store/                    # Глобальный store (если необходим)
│
├── entities/                     # Бизнес-сущности
│   ├── candidate/                # Сущность кандидата
│   │   ├── api.ts                # API методы
│   │   ├── model.ts              # Модель и типы
│   │   └── ui/                   # UI компоненты сущности
│   ├── user/
│   ├── employee/
│   ├── department/
│   ├── team/
│   └── job/
│
├── features/                     # Фича-модули (бизнес-логика)
│   ├── auth/                     # Авторизация
│   ├── recruiting/               # Рекрутинг
│   │   ├── vacancies/            # Управление вакансиями
│   │   ├── candidate-responses/  # Отклики кандидатов
│   │   ├── hiring-requests/      # Заявки на найм
│   │   └── invites/              # Приглашения на интервью
│   ├── ai/                       # AI функционал (ATS)
│   ├── employees/                # Управление сотрудниками
│   ├── performance/              # Оценка эффективности
│   ├── learning/                 # Обучение
│   ├── onboarding/               # Онбординг
│   ├── compensation/             # Компенсации
│   ├── analytics/                # Аналитика
│   ├── notifications/            # Уведомления
│   ├── workflow/                 # Рабочие процессы
│   └── ...
│
├── shared/                       # Переиспользуемый код
│   ├── api/                      # API клиент
│   │   ├── interceptors/         # Axios interceptors
│   │   └── *.ts                  # API модули
│   ├── components/               # Общие компоненты
│   │   ├── ui/                   # UI Kit (Button, Input, Dialog, etc.)
│   │   ├── forms/                # Формы (DatePicker, FileUpload, etc.)
│   │   ├── feedback/             # Обратная связь (Toast, Alert, Modal)
│   │   ├── navigation/           # Навигация (Header, Sidebar, Breadcrumbs)
│   │   ├── layout/               # Layout (Container, Grid, StatusBar)
│   │   ├── data-display/         # Отображение данных (Table, KanbanBoard)
│   │   ├── charts/               # Графики
│   │   └── business/             # Бизнес-компоненты (StatusBadge, MetricCard)
│   ├── hooks/                    # Общие хуки
│   ├── lib/                      # Утилиты и хелперы
│   ├── types/                    # Общие типы
│   ├── config/                   # Конфигурация
│   ├── stores/                   # Глобальные сторы
│   └── styles/                   # Глобальные стили
│
└── types/                        # Глобальные типы TypeScript
```

## Архитектурные принципы

### Feature-Sliced Design (FSD)

Проект следует адаптированной версии FSD с упором на практичность:

1. **Однонаправленные зависимости**: Слои могут импортировать только из нижележащих слоев
   - `app/` → `features/` → `entities/` → `shared/`

2. **Изоляция фич**: Каждая фича — самодостаточный модуль со своими компонентами, API и типами

3. **Публичный API**: Каждый модуль экспортирует только необходимое через `index.ts`

### Правила импортов

```typescript
// ✅ Правильно
import { Button } from '@/shared/components/ui/Button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { CandidateCard } from '@/entities/candidate/ui/CandidateCard'

// ❌ Неправильно (импорт из соседней фичи)
import { VacancyStore } from '@/features/recruiting/store'
// в features/employees/
```

## Разработка

### Установка зависимостей

```bash
npm install
```

### Запуск dev-сервера

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3001`

### Сборка

```bash
npm run build
```

### Тестирование

```bash
npm run test        # Запуск тестов
npm run test:watch  # Тесты в watch режиме
npm run test:coverage  # Покрытие кода
```

### Линтинг

```bash
npm run lint        # Проверка ESLint
npm run lint:fix    # Автоисправление
```

## Конвенции кода

### Компоненты

- Функциональные компоненты с хуками
- Именованный экспорт (`export const Component`)
- Один компонент — один файл (до 200 строк)
- CSS Modules для стилей

```typescript
// UserCard.tsx
import styles from './UserCard.module.css'

interface UserCardProps {
  user: User
  onSelect?: (id: string) => void
}

export const UserCard = ({ user, onSelect }: UserCardProps) => {
  return (
    <div className={styles.card} onClick={() => onSelect?.(user.id)}>
      {user.name}
    </div>
  )
}
```

### Типы

- `interface` для объектов
- `type` для union/intersection
- Строгая типизация (без `any`)

### Стейт-менеджмент

- Локальный стейт: `useState`, `useReducer`
- Серверный стейт: TanStack React Query
- Глобальный стейт: Zustand (при необходимости)

## Мок-данные

На текущем этапе приложение работает с мок-данными. Каждая фича содержит файл `mocks.ts`:

```typescript
// features/recruiting/vacancies/mocks.ts
import { Vacancy } from './types'

export const mockVacancies: Vacancy[] = [
  { id: '1', title: 'Frontend Developer', status: 'active' },
  { id: '2', title: 'Backend Developer', status: 'draft' },
]

export const fetchVacanciesMock = (): Promise<Vacancy[]> =>
  new Promise((resolve) => setTimeout(() => resolve(mockVacancies), 500))
```

## Полезные ресурсы

- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Router](https://tanstack.com/router)
- [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**Версия:** 1.0  
**Последнее обновление:** Март 2026
