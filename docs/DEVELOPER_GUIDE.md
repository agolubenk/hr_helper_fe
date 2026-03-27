# Гайд для разработчиков

Руководство по разработке HR Helper Frontend.

## Быстрый старт

```bash
# Клонирование репозитория
git clone <repo-url>
cd hr_helper_fe

# Установка зависимостей
cd frontend && npm install

# Запуск dev-сервера
npm run dev
```

Приложение будет доступно на http://localhost:3001 (порт по умолчанию в `vite.config`); для **3000/3001** в корневых скриптах см. ниже.

### Скрипты в корне репозитория

| Скрипт | URL |
|--------|-----|
| `./start-dev.sh` | Next **3001** + новый Vite **3000** |
| `./start-dev-new.sh` | только новый фронт **3001** |
| `./start-dev-migration.sh` | только `fe_migration` **3000** |

---

## Архитектура проекта

Проект использует адаптированную версию [Feature-Sliced Design](https://feature-sliced.design/).

### Структура слоёв

```
src/
├── app/          # Инициализация, провайдеры, роутинг
├── features/     # Бизнес-логика и фичи
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемый код
```

### Правила импортов (FSD)

```
app/      → может импортировать из features/, entities/, shared/
features/ → может импортировать из entities/, shared/
entities/ → может импортировать только из shared/
shared/   → не может импортировать из других слоёв
```

ESLint автоматически проверяет эти правила.

---

## Создание компонентов

### UI компоненты (shared/components/ui/)

```tsx
// shared/components/ui/Button/Button.tsx
import styles from './Button.module.css'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
}: ButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### Feature компоненты

```tsx
// features/recruiting/vacancies/components/VacancyList.tsx
import { VacancyCard } from '@/entities/vacancy'
import { useVacancies } from '../hooks/useVacancies'

export const VacancyList = () => {
  const { vacancies, isLoading } = useVacancies()

  if (isLoading) return <Spinner />

  return (
    <div>
      {vacancies.map((v) => (
        <VacancyCard key={v.id} vacancy={v} />
      ))}
    </div>
  )
}
```

### Entity компоненты

```tsx
// entities/vacancy/ui/VacancyCard.tsx
import type { VacancyListItem } from '../model'

interface VacancyCardProps {
  vacancy: VacancyListItem
  onClick?: (id: number) => void
}

export const VacancyCard = ({ vacancy, onClick }: VacancyCardProps) => {
  return (
    <div onClick={() => onClick?.(vacancy.id)}>
      <h3>{vacancy.title}</h3>
      <span>{vacancy.status}</span>
    </div>
  )
}
```

---

## Работа с данными

### API клиент

```typescript
import { apiClient } from '@/shared/api/client'

// GET запрос
const users = await apiClient.get<User[]>('/users')

// POST запрос
const newUser = await apiClient.post<User>('/users', { name: 'John' })
```

### Мок-данные

Все API работают с моками. Структура:

```typescript
// entities/vacancy/api.ts
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const mockVacancies: Vacancy[] = [
  { id: 1, title: 'Frontend Developer', status: 'active' },
]

export const vacancyApi = {
  async getList(): Promise<Vacancy[]> {
    await delay(300)
    return mockVacancies
  },
}
```

### TanStack Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['vacancies'],
  queryFn: () => vacancyApi.getList(),
})

const mutation = useMutation({
  mutationFn: vacancyApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['vacancies'] })
  },
})
```

---

## Стейт-менеджмент

### Локальный стейт

```typescript
const [value, setValue] = useState('')
const [isOpen, { toggle, setTrue, setFalse }] = useToggle()
```

### Глобальный стейт (Zustand)

```typescript
// shared/stores/example.ts
import { create } from 'zustand'

interface ExampleStore {
  count: number
  increment: () => void
}

export const useExampleStore = create<ExampleStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))
```

---

## Feature Flags

### Использование

```tsx
import { useFeatureFlag, FeatureFlag } from '@/shared/lib/feature-flags'

// Хук
const isEnabled = useFeatureFlag('new_dashboard')

// Компонент
<FeatureFlag flag="ai_assistant">
  <AIAssistantWidget />
</FeatureFlag>

<FeatureFlag flag="advanced_analytics" fallback={<BasicAnalytics />}>
  <AdvancedAnalytics />
</FeatureFlag>
```

### Добавление нового флага

```typescript
// shared/lib/feature-flags/types.ts
export type FeatureFlagKey =
  | 'existing_flag'
  | 'my_new_flag'  // Добавить сюда

// shared/lib/feature-flags/config.ts
export const defaultFlags = {
  // ...
  my_new_flag: {
    key: 'my_new_flag',
    enabled: false,
    description: 'Описание фичи',
    rolloutPercentage: 50, // Опционально
  },
}
```

---

## Тестирование

### Запуск тестов

```bash
npm run test        # Watch mode
npm run test:run    # Однократный запуск
npm run test:coverage  # С покрытием
```

### Пример теста

```typescript
// __tests__/VacancyCard.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VacancyCard } from '../VacancyCard'

describe('VacancyCard', () => {
  it('renders vacancy title', () => {
    render(<VacancyCard vacancy={{ id: 1, title: 'Test' }} />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## Стилизация

### CSS Modules

```tsx
import styles from './Component.module.css'

<div className={styles.container}>
  <span className={styles.title}>Title</span>
</div>
```

### Radix UI Themes

```tsx
import { Box, Flex, Text, Button } from '@radix-ui/themes'

<Flex gap="3" align="center">
  <Box>
    <Text size="2">Label</Text>
  </Box>
  <Button variant="soft">Action</Button>
</Flex>
```

### Тема

```typescript
import { useTheme } from '@/shared/lib/theme'

const { theme, toggleTheme } = useTheme()
// theme: 'light' | 'dark'
```

---

## Утилиты

### Строки

```typescript
import { capitalize, truncate, slugify, pluralize } from '@/shared/utils/string'

capitalize('hello') // 'Hello'
truncate('Long text', 5) // 'Lo...'
slugify('Hello World') // 'hello-world'
pluralize(5, 'день', 'дня', 'дней') // 'дней'
```

### Массивы

```typescript
import { chunk, unique, groupBy, sortBy } from '@/shared/utils/array'

chunk([1, 2, 3, 4], 2) // [[1, 2], [3, 4]]
unique([1, 1, 2]) // [1, 2]
groupBy(items, (i) => i.type) // { type1: [...], type2: [...] }
sortBy(items, (i) => i.name) // sorted array
```

### Даты

```typescript
import { formatDate, addDays, isSameDay } from '@/shared/utils/date'

formatDate(new Date(), 'short') // '13.03.2026'
addDays(new Date(), 7) // Date + 7 days
isSameDay(date1, date2) // boolean
```

### Хуки

```typescript
import { useDebounce } from '@/shared/hooks/useDebounce'
import { useToggle } from '@/shared/hooks/useToggle'
import { useLocalStorage } from '@/shared/hooks/useLocalStorage'

const debouncedSearch = useDebounce(search, 300)
const { value, toggle, setTrue, setFalse } = useToggle()
const [stored, setStored] = useLocalStorage('key', defaultValue)
```

---

## Lazy Loading

### Использование

```typescript
import { lazyLoad, lazyLoadNamed } from '@/shared/lib/lazy'

// Default export
const LazyPage = lazyLoad(() => import('./Page'))

// Named export
const LazyComponent = lazyLoadNamed(
  () => import('./components'),
  'MyComponent'
)
```

---

## Конвенции

### Именование

- Компоненты: `PascalCase` (`VacancyCard.tsx`)
- Хуки: `camelCase` с префиксом `use` (`useVacancies.ts`)
- Утилиты: `camelCase` (`formatDate.ts`)
- Типы: `PascalCase` (`VacancyStatus`)
- Константы: `UPPER_SNAKE_CASE` (`API_BASE_URL`)

### Экспорты

- Именованный экспорт для компонентов: `export const Button`
- Barrel exports через `index.ts`

### Файлы

- Один компонент — один файл (до 200 строк)
- Стили рядом с компонентом: `Component.module.css`
- Тесты в `__tests__/` или рядом: `Component.test.tsx`

---

## Troubleshooting

### ESLint ошибки FSD

```
error: '@/app/...' import is restricted (FSD rule)
```

**Решение**: Перенести общую логику в `shared/` или изменить структуру импортов.

### Тесты не запускаются

```bash
npm install  # Убедиться, что зависимости установлены
npm run test
```

### HMR не работает

Перезапустите dev-сервер:

```bash
npm run dev
```

---

## Полезные ссылки

- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [Radix UI](https://www.radix-ui.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Vitest](https://vitest.dev/)
