# API Layer

Модуль для работы с серверным API.

## Структура

```
shared/api/
├── client.ts        # Базовый API клиент
├── queryClient.ts   # Конфигурация TanStack Query
├── types.ts         # Общие типы API
├── interceptors/    # Interceptors для обработки запросов/ответов
├── profile.ts       # API профиля пользователя
├── wiki.ts          # API wiki
└── internal-site.ts # API внутреннего сайта
```

## API Client

Основной клиент для HTTP-запросов (`client.ts`).

### Методы

```typescript
import { apiClient } from '@/shared/api/client'

// GET запрос
const data = await apiClient.get<User>('/users/me')

// GET с параметрами
const users = await apiClient.get<User[]>('/users', {
  params: { page: '1', limit: '10' }
})

// POST запрос
const newUser = await apiClient.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
})

// PUT запрос
const updatedUser = await apiClient.put<User>('/users/1', {
  name: 'Jane Doe'
})

// PATCH запрос
const patchedUser = await apiClient.patch<User>('/users/1', {
  name: 'Jane Smith'
})

// DELETE запрос
await apiClient.delete('/users/1')
```

### Аутентификация

Клиент автоматически добавляет заголовки:
- `Authorization: Bearer <token>` — из `localStorage.access_token`
- `X-Tenant-ID: <id>` — из `localStorage.tenant_id`

### Конфигурация

Базовый URL API настраивается через переменную окружения:

```env
VITE_API_URL=http://localhost:8000/api
```

По умолчанию: `/api`

## TanStack Query

Для кэширования и управления серверным состоянием используется TanStack Query.

### Конфигурация

```typescript
// shared/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут
      retry: 1,
    },
  },
})
```

### Использование

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'

// Запрос данных
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiClient.get<User[]>('/users'),
})

// Мутация
const mutation = useMutation({
  mutationFn: (data: CreateUserData) => 
    apiClient.post<User>('/users', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] })
  },
})
```

## Interceptors

### Error Interceptor

```typescript
// shared/api/interceptors/error.interceptor.ts
```

Перехватывает ошибки HTTP и преобразует их в понятные сообщения:
- 401 → Редирект на страницу логина
- 403 → Показ ошибки доступа
- 500 → Показ общей ошибки сервера

## Entity APIs

Каждая сущность имеет свой API модуль:

### Vacancy API

```typescript
import { vacancyApi } from '@/entities/vacancy'

// Получить список вакансий
const vacancies = await vacancyApi.getList({ status: ['active'] })

// Получить вакансию по ID
const vacancy = await vacancyApi.getById(123)

// Создать вакансию
const newVacancy = await vacancyApi.create({
  title: 'Frontend Developer',
  status: 'draft',
  priority: 'high',
  recruiterId: '1',
  locationIds: ['1'],
})

// Обновить вакансию
const updated = await vacancyApi.update({
  id: 123,
  title: 'Senior Frontend Developer',
})

// Изменить статус
await vacancyApi.changeStatus(123, 'active')

// Удалить вакансию
await vacancyApi.delete(123)
```

### Company API

```typescript
import { companyApi } from '@/entities/company'

// Получить текущую компанию
const company = await companyApi.getCurrent()

// Обновить данные компании
const updated = await companyApi.update({
  name: 'New Company Name',
  settings: { timezone: 'Europe/Moscow' },
})

// Управление интеграциями
await companyApi.enableIntegration('telegram-bot-id')
await companyApi.disableIntegration('slack-id')

// Обновить брендинг
await companyApi.updateBranding({
  primaryColor: '#3b82f6',
  logoUrl: '/logo.svg',
})
```

## Моки

На текущем этапе все API работают с мок-данными. Моки находятся в папках entities:

```
entities/
├── vacancy/
│   └── api.ts    # Содержит mockVacancies и методы с delay()
└── company/
    └── api.ts    # Содержит mockCompany и методы с delay()
```

### Пример мока

```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const mockData: User[] = [
  { id: '1', name: 'John Doe' },
]

export const userApi = {
  async getList(): Promise<User[]> {
    await delay(300) // Имитация сетевой задержки
    return mockData
  },
}
```

## Типы

### RequestConfig

```typescript
interface RequestConfig extends RequestInit {
  params?: Record<string, string>
}
```

### Стандартный ответ API

```typescript
interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

### Ошибка API

```typescript
interface ApiError {
  message: string
  code: string
  details?: Record<string, string[]>
}
```

## Best Practices

1. **Типизация**: Всегда указывайте типы для ответов API
2. **Кэширование**: Используйте TanStack Query для кэширования
3. **Обработка ошибок**: Используйте try/catch или onError в mutations
4. **Моки**: Храните моки рядом с entity, а не в компонентах
5. **Delay**: Используйте delay() в моках для имитации реальной загрузки
