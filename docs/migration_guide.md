# Руководство по миграции из frontend old в frontend

**Дата:** 11 марта 2026  
**Версия:** 1.0  
**Автор:** Senior Software Engineer

---

## Введение

Этот документ описывает пошаговую миграцию функциональности из старого проекта `frontend old` (Next.js 14) в новый проект `frontend` (Vite + TanStack Router). Документ составлен так, чтобы его мог понять и выполнить разработчик любого уровня.

### Ключевые различия проектов

\begin{table}
\centering
\begin{tabular}{|l|l|l|}
\hline
\textbf{Аспект} & \textbf{frontend old} & \textbf{frontend} \\
\hline
Фреймворк & Next.js 14 (App Router) & Vite + React 18 SPA \\
Роутинг & Файловый (app/) & TanStack Router \\
Стейт & React Context / локальный & Zustand \\
Данные & lib/api.ts (fetch) & TanStack React Query \\
Структура & app/ + components/ + lib/ & features/ + shared/ + entities/ \\
\hline
\end{tabular}
\caption{Сравнение технологических стеков}
\end{table}

**Важно:** Проекты имеют совершенно разную архитектуру. Прямое копирование кода невозможно — каждый модуль требует адаптации под новую структуру[cite:96][cite:97][cite:90].

---

## Итог миграции (актуальный статус)

**Миграция страниц завершена.** Все модули по приоритетам 1–3 перенесены или имеют MVP/заглушку в новом проекте; маршруты подключены.

**Компоненты:**
- **Toast** — в новом проекте уже есть аналог: \texttt{shared/components/feedback/Toast} (используется в фичах).
- **FloatingActions, GlobalSearch, StatusBar, FloatingLabelInput** — перенос запланирован на этап **точечных доработок** (требуют адаптации роутинга, темы и/или объёмны).

**Дальнейшие шаги:** точечные доработки по необходимости (полный Recruiter Chat, перенос перечисленных shared-компонентов, сверка Header/Sidebar/ThemeProvider).

\subsection*{Выполненные точечные доработки}
\begin{itemize}
\item \textbf{RecrChat (полный объём):}
  \begin{itemize}
  \item Маршруты: /recr-chat, /recr-chat/vacancy/\$vacancyId/candidate/\$candidateId; assessment: /assessment/new, /assessment/\$assessmentId, /assessment/\$assessmentId/edit (страницы-заглушки с навигацией).
  \item Левая колонка: три вкладки (Candidates, Chat, Настройки вакансии); поиск; полоса workflow (быстрые кнопки, Скрининг/Интервью, кнопка «слоты» → Dialog с SlotsPanel); список кандидатов с аватарами, бейджами; во вкладке Chat — компонент WorkflowChat.
  \item Правая колонка: подтабы карточки (Info, Activity, Ratings, Documents, History); Info: Application Details, блок Контакты (email, телефон), блок Соцсети и мессенджеры; остальные подтабы — заглушки.
  \item Настройки вакансии: список разделов (текст вакансии, рекрутеры, вопросы, зарплата, Scorecard и т.д.) и заглушка правой колонки.
  \item Моки: расширенные поля кандидата, в т.ч. social (LinkedIn, Telegram и др.).
  \end{itemize}
\item \textbf{StatusBar:} минимальная панель RecrChatStatusBar (выбор вакансии, пилли статусов) под Header на страницах /recr-chat; подключена в MainLayout.
\item \textbf{FloatingLabelInput:} уже реализован в shared/components/forms/FloatingLabelInput.tsx.
\item \textbf{Страницы настроек вакансии (company-settings/recruiting):}
  \begin{itemize}
  \item \textbf{Правила привлечения} (/company-settings/recruiting/rules): перенесена из frontend old; таблица правил, поиск, форма добавления, inline-редактирование, удаление с подтверждением через Toast; мок-данные.
  \item \textbf{Шаблон оффера} (/company-settings/recruiting/offer-template): перенесена из frontend old; загрузка файла (DOCX, PPTX, Figma), предпросмотр DOCX/PPTX (mammoth, jszip), настройка переменных по категориям, добавление/удаление переменных, модальный предпросмотр на мобильных.
  \end{itemize}
\end{itemize}

---

## Текущее состояние нового проекта

### Существующие страницы и маршруты

В новом проекте `frontend` уже реализованы следующие страницы (маршруты находятся в `src/routes/`)[cite:88][cite:102]:

\begin{itemize}
\item \textbf{/} — главная страница (IndexPage)
\item \textbf{/profile} — профиль пользователя (ProfilePage)
\item \textbf{/admin} — панель администратора (AdminPage)
\item \textbf{/calendar} — календарь событий (CalendarPage)
\item \textbf{/company-settings} — настройки компании (CompanySettingsPage)
\item \textbf{/wiki/*} — база знаний (wiki маршруты)
\item \textbf{/projects/*} — проекты (features/projects)
\item \textbf{/analytics} — аналитика (есть в features/, но не полноценный reporting)
\item \textbf{/employees} — управление сотрудниками
\end{itemize}

### Существующая структура меню навигации

Навигация в новом проекте находится в `src/shared/components/navigation/`[cite:102]. Текущие пункты меню:

\begin{itemize}
\item Главная
\item Проекты
\item Календарь
\item Сотрудники
\item Аналитика
\item Wiki
\item Настройки компании
\item Профиль
\item Админ-панель (для администраторов)
\end{itemize}

---

## Страницы для миграции

### Приоритет 1: Критичные модули рекрутинга

Эти страницы отсутствуют в новом проекте и требуют переноса в первую очередь[cite:98]:

\begin{enumerate}
\item \textbf{Вакансии} (frontend old: app/vacancies/) \textbf{[ВЫПОЛНЕНО → /vacancies]}
  \begin{itemize}
  \item Новый маршрут: /recruiting/vacancies
  \item Целевая папка: features/recruiting/vacancies/
  \item Пункт меню: "Вакансии" в разделе "Рекрутинг"
  \end{itemize}

\item \textbf{Заявки на подбор} (frontend old: app/hiring-requests/) \textbf{[ВЫПОЛНЕНО → /hiring-requests]}
  \begin{itemize}
  \item Новый маршрут: /recruiting/hiring-requests
  \item Целевая папка: features/recruiting/hiring-requests/
  \item Пункт меню: "Заявки на подбор" в разделе "Рекрутинг"
  \end{itemize}

\item \textbf{Отклики кандидатов} (frontend old: app/candidate-responses/) \textbf{[ВЫПОЛНЕНО → /candidate-responses]}
  \begin{itemize}
  \item Новый маршрут: /recruiting/candidate-responses
  \item Целевая папка: features/recruiting/candidate-responses/
  \item Пункт меню: "Отклики" в разделе "Рекрутинг"
  \end{itemize}

\item \textbf{Интеграция Huntflow} (frontend old: app/huntflow/) \textbf{[ВЫПОЛНЕНО → /huntflow, /recruiting/huntflow]}
  \begin{itemize}
  \item Новый маршрут: /recruiting/huntflow
  \item Целевая папка: features/recruiting/huntflow/
  \item Пункт меню: "Huntflow" в разделе "Интеграции"
  \end{itemize}

\item \textbf{Управление интервьюерами} (frontend old: app/interviewers/) \textbf{[ВЫПОЛНЕНО → /interviewers]}
  \begin{itemize}
  \item Новый маршрут: /recruiting/interviewers
  \item Целевая папка: features/recruiting/interviewers/
  \item Пункт меню: "Интервьюеры" в разделе "Рекрутинг"
  \end{itemize}

\item \textbf{Приглашения} (frontend old: app/invites/) \textbf{[ВЫПОЛНЕНО → /invites]}
  \begin{itemize}
  \item Новый маршрут: /recruiting/invites
  \item Целевая папка: features/recruiting/invites/
  \item Пункт меню: "Приглашения" в разделе "Рекрутинг"
  \end{itemize}
\end{enumerate}

### Приоритет 2: Бизнес-критичные модули

\begin{enumerate}
\item \textbf{Финансы} (frontend old: app/finance/) \textbf{[ВЫПОЛНЕНО (частично): /finance/benchmarks]}
  \begin{itemize}
  \item Новый маршрут: /finance
  \item Целевая папка: features/finance/
  \item Пункт меню: "Финансы" (корневой раздел)
  \end{itemize}

\item \textbf{Отчётность} (frontend old: app/reporting/) \textbf{[ВЫПОЛНЕНО (MVP): /reporting, /reporting/company, /reporting/hiring-plan*]}
  \begin{itemize}
  \item Новый маршрут: /reporting
  \item Целевая папка: features/reporting/
  \item Пункт меню: "Отчёты" (корневой раздел)
  \item Примечание: не путать с существующей /analytics — это разные модули
  \end{itemize}

\item \textbf{Специализации} (frontend old: app/specializations/) \textbf{[ВЫПОЛНЕНО (MVP): /specializations, /specializations/$id/info]}
  \begin{itemize}
  \item Новый маршрут: /settings/specializations
  \item Целевая папка: features/specializations/
  \item Пункт меню: "Специализации" в разделе "Настройки"
  \end{itemize}

\item \textbf{Workflow} (frontend old: app/workflow/) \textbf{[ВЫПОЛНЕНО, ПЕРЕСМОТРЕНО → /workflow]}
  \begin{itemize}
  \item Новый маршрут: /workflow
  \item Целевая папка: features/workflow/
  \item Пункт меню: "Воркфлоу" (корневой раздел)
  \item Пересмотр: перенесены полный WorkflowHeader (панель интервью, все быстрые кнопки, 30/90 мин), полный WorkflowChat (команды \#add/\#hr\_screening/\#tech\_screening/\#interview/\#delete, файлы, карточки кандидатов, отказы), блок быстрых действий в сайдбаре
  \end{itemize}
\end{enumerate}

### Приоритет 3: Интеграции и дополнительные модули

\begin{enumerate}
\item \textbf{AI Chat} (frontend old: app/aichat/) \textbf{[ВЫПОЛНЕНО (MVP): /aichat]}
  \begin{itemize}
  \item Новый маршрут: /ai/chat
  \item Целевая папка: features/ai/chat/
  \item Пункт меню: "AI Ассистент" в разделе "Инструменты"
  \end{itemize}

\item \textbf{Recruiter Chat} (frontend old: app/recr-chat/) \textbf{[MVP: /ai/recruiter-chat, /recr-chat, /recr-chat/vacancy/\$vacancyId/candidate/\$candidateId]}
  \begin{itemize}
  \item Маршруты: /ai/recruiter-chat (обзор), /recr-chat (ATS | Talent Pool), /recr-chat/vacancy/1/candidate/1 — доступны
  \item Целевая папка: features/ai/recruiter-chat/
  \item Пункт меню: "ATS | Talent Pool" ведёт на /recr-chat/vacancy/1/candidate/1
  \item Точечная доработка: полный интерфейс (список вакансий, кандидатов, карточка, ассессменты)
  \end{itemize}

\item \textbf{Telegram интеграция} (frontend old: app/telegram/) \textbf{[ВЫПОЛНЕНО (MVP): /integrations/telegram]}
  \begin{itemize}
  \item Новый маршрут: /integrations/telegram
  \item Целевая папка: features/integrations/telegram/
  \item Пункт меню: "Telegram" в разделе "Интеграции"
  \item Перенесены: страница входа (QR-код, форма по номеру телефона)
  \end{itemize}
\end{enumerate}

\subsection*{Чек-лист завершённых миграций страниц}
\begin{itemize}
\item Приоритет 1 (рекрутинг): Вакансии, Заявки на подбор, Отклики, Huntflow, Интервьюеры, Приглашения — \textbf{выполнено}
\item Приоритет 2 (бизнес): Финансы (benchmarks), Отчётность (dashboard, company, hiring-plan), Специализации (layout, tree, info), Workflow (полный пересмотр) — \textbf{выполнено}
\item Приоритет 3 (интеграции): AI Chat, Recruiter Chat (MVP-заглушка), Telegram — \textbf{выполнено}
\end{itemize}

---

## Компоненты для миграции

### Критичные UI-компоненты

Эти компоненты из `frontend old/components/` отсутствуют в новом проекте[cite:98]:

\begin{enumerate}
\item \textbf{FloatingActions.tsx} (62 КБ) \textbf{[ОТЛОЖЕНО — точечные доработки]}
  \begin{itemize}
  \item Целевая папка: shared/components/floating-actions/
  \item Использование: плавающие кнопки действий в интерфейсе
  \item Требует: адаптация useRouter/usePathname → TanStack Router, useTheme
  \end{itemize}

\item \textbf{GlobalSearch} (папка) \textbf{[ОТЛОЖЕНО — точечные доработки]}
  \begin{itemize}
  \item Целевая папка: shared/components/search/GlobalSearch/
  \item Использование: глобальный поиск по всем сущностям
  \item Добавить в навигацию: иконка поиска в шапке (Cmd+K для открытия)
  \end{itemize}

\item \textbf{StatusBar.tsx} (24 КБ) \textbf{[ОТЛОЖЕНО — точечные доработки]}
  \begin{itemize}
  \item Целевая папка: shared/components/layout/StatusBar/
  \item Использование: строка состояния приложения (внизу экрана); завязан на recr-chat
  \end{itemize}

\item \textbf{FloatingLabelInput.tsx} \textbf{[ОТЛОЖЕНО — точечные доработки]}
  \begin{itemize}
  \item Целевая папка: shared/ui/forms/FloatingLabelInput/
  \item Использование: инпуты с плавающей меткой (Material Design стиль)
  \end{itemize}

\item \textbf{Toast} (папка) \textbf{[ЕСТЬ АНАЛОГ В НОВОМ ПРОЕКТЕ]}
  \begin{itemize}
  \item В frontend: shared/components/feedback/Toast/ (ToastContext, useToast)
  \item Используется в: Huntflow, Benchmarks, Interviewers, Invites, Candidate Responses и др.
  \end{itemize}
\end{enumerate}

### Компоненты для сверки и дополнения

Эти компоненты частично существуют в новом проекте; сверка запланирована на этап точечных доработок:

\begin{enumerate}
\item \textbf{Header.tsx} (23 КБ в старом) \textbf{[СВЕРКА — точечные доработки]}
  \begin{itemize}
  \item Существующий: shared/components/navigation/
  \item Действие: сверить функциональность, перенести недостающие элементы
  \end{itemize}

\item \textbf{Sidebar.tsx} (74 КБ в старом) \textbf{[СВЕРКА — точечные доработки]}
  \begin{itemize}
  \item Существующий: shared/components/navigation/
  \item Действие: сверить навигационные пункты, добавить новые разделы
  \end{itemize}

\item \textbf{ThemeProvider.tsx} (18 КБ в старом) \textbf{[СВЕРКА — точечные доработки]}
  \begin{itemize}
  \item Существующий: app/providers/
  \item Действие: сверить темы, палитры, CSS-переменные
  \end{itemize}
\end{enumerate}

---

## Пошаговая инструкция миграции

### Шаг 1: Подготовка окружения

\begin{enumerate}
\item Убедитесь, что оба проекта (frontend old и frontend) находятся в рабочем состоянии
\item Установите зависимости в обоих проектах:
\end{enumerate}

cd frontend-old && npm install
cd ../frontend && npm install

\begin{enumerate}
\setcounter{enumi}{2}
\item Создайте новую ветку для миграции:
\end{enumerate}

cd frontend
git checkout -b feature/migrate-from-old

### Шаг 2: Миграция структуры данных

Для каждого модуля выполните следующие действия:

\begin{enumerate}
\item \textbf{Изучите типы данных} в старом проекте
  \begin{itemize}
  \item Откройте файлы типов в frontend old (обычно lib/types.ts или в папке модуля)
  \item Скопируйте интерфейсы сущностей
  \end{itemize}

\item \textbf{Создайте types.ts в новом проекте}
  \begin{itemize}
  \item Путь: features/[module-name]/types.ts
  \item Адаптируйте типы под TypeScript strict mode
  \item Удалите неиспользуемые поля
  \end{itemize}

\item \textbf{Создайте mocks.ts}
  \begin{itemize}
  \item Путь: features/[module-name]/mocks.ts
  \item Возьмите примеры данных из старого проекта
  \item Создайте массив из 5-10 мок-объектов для тестирования
  \end{itemize}
\end{enumerate}

**Пример для модуля vacancies:**

// frontend/src/features/recruiting/vacancies/types.ts
export interface Vacancy {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'paused';
  department: string;
  createdAt: string;
  salary?: {
    from: number;
    to: number;
    currency: string;
  };
}

// frontend/src/features/recruiting/vacancies/mocks.ts
import { Vacancy } from './types';

export const mockVacancies: Vacancy[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    description: 'Ищем опытного React-разработчика...',
    status: 'open',
    department: 'Engineering',
    createdAt: '2026-03-01T10:00:00Z',
    salary: { from: 200000, to: 300000, currency: 'RUB' }
  },
  // ... ещё 4-9 объектов
];

### Шаг 3: Создание структуры модуля

Для каждого модуля создайте папки:

mkdir -p src/features/recruiting/vacancies/{components,hooks,store}
touch src/features/recruiting/vacancies/{types.ts,mocks.ts,index.ts}

Структура модуля должна выглядеть так:

features/recruiting/vacancies/
├── components/          # UI-компоненты модуля
│   ├── VacancyList.tsx
│   ├── VacancyCard.tsx
│   └── VacancyForm.tsx
├── hooks/               # Кастомные хуки (если нужны)
│   └── useVacancyFilters.ts
├── store/               # Zustand store или Redux slice
│   └── vacanciesStore.ts
├── types.ts             # Типы данных
├── mocks.ts             # Мок-данные
└── index.ts             # Публичный API модуля

### Шаг 4: Миграция API-слоя

\begin{enumerate}
\item \textbf{Найдите API-вызовы в старом проекте}
  \begin{itemize}
  \item Обычно в lib/api.ts или в папке модуля
  \item Выпишите все эндпоинты (GET, POST, PUT, DELETE)
  \end{itemize}

\item \textbf{Создайте файл api.ts в модуле}
  \begin{itemize}
  \item Путь: features/[module-name]/api.ts
  \item Используйте TanStack Query (React Query) вместо прямых fetch-вызовов
  \end{itemize}

\item \textbf{На текущем этапе замените на моки}
  \begin{itemize}
  \item Вместо реальных API-вызовов верните Promise с мок-данными
  \item Добавьте setTimeout для имитации задержки сети
  \end{itemize}
\end{enumerate}

**Пример:**

// frontend/src/features/recruiting/vacancies/api.ts
import { mockVacancies } from './mocks';
import type { Vacancy } from './types';

export const fetchVacancies = (): Promise<Vacancy[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockVacancies), 500);
  });
};

export const createVacancy = (data: Omit<Vacancy, 'id'>): Promise<Vacancy> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newVacancy: Vacancy = {
        ...data,
        id: String(Date.now()),
      };
      resolve(newVacancy);
    }, 300);
  });
};

### Шаг 5: Создание Zustand store

\begin{enumerate}
\item \textbf{Создайте store для модуля}
  \begin{itemize}
  \item Путь: features/[module-name]/store/[moduleName]Store.ts
  \item Используйте Zustand вместо Redux для простых случаев
  \end{itemize}

\item \textbf{Определите состояние и действия}
  \begin{itemize}
  \item Состояние: данные, статусы загрузки, ошибки
  \item Действия: fetch, create, update, delete
  \end{itemize}
\end{enumerate}

**Пример:**

// frontend/src/features/recruiting/vacancies/store/vacanciesStore.ts
import { create } from 'zustand';
import type { Vacancy } from '../types';
import { fetchVacancies, createVacancy } from '../api';

interface VacanciesState {
  vacancies: Vacancy[];
  isLoading: boolean;
  error: string | null;
  fetchVacancies: () => Promise<void>;
  addVacancy: (data: Omit<Vacancy, 'id'>) => Promise<void>;
}

export const useVacanciesStore = create<VacanciesState>((set) => ({
  vacancies: [],
  isLoading: false,
  error: null,

  fetchVacancies: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchVacancies();
      set({ vacancies: data, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addVacancy: async (data) => {
    try {
      const newVacancy = await createVacancy(data);
      set((state) => ({ 
        vacancies: [...state.vacancies, newVacancy] 
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));

### Шаг 6: Миграция компонентов

\begin{enumerate}
\item \textbf{Изучите компоненты в старом проекте}
  \begin{itemize}
  \item Откройте файлы компонентов в frontend old/app/[module]/
  \item Выпишите основные компоненты и их назначение
  \end{itemize}

\item \textbf{Декомпозируйте на простые компоненты}
  \begin{itemize}
  \item List-компонент (список сущностей)
  \item Card/Item-компонент (карточка одной сущности)
  \item Form-компонент (форма создания/редактирования)
  \item Filters-компонент (фильтры, если есть)
  \end{itemize}

\item \textbf{Создайте компоненты в новом проекте}
  \begin{itemize}
  \item Путь: features/[module-name]/components/
  \item Используйте функциональные компоненты + хуки
  \item Типизируйте пропсы через interface
  \item Данные получайте через Zustand store
  \end{itemize}

\item \textbf{Замените UI-библиотеку на Radix UI}
  \begin{itemize}
  \item Вместо Material UI / Bootstrap используйте Radix Primitives
  \item Кнопки, диалоги, селекты — через обёртки из shared/ui/
  \end{itemize}
\end{enumerate}

**Пример компонента списка:**

// frontend/src/features/recruiting/vacancies/components/VacancyList.tsx
import { useEffect } from 'react';
import { useVacanciesStore } from '../store/vacanciesStore';
import { VacancyCard } from './VacancyCard';

export const VacancyList = () => {
  const { vacancies, isLoading, error, fetchVacancies } = useVacanciesStore();

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  if (isLoading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="vacancy-list">
      {vacancies.map((vacancy) => (
        <VacancyCard key={vacancy.id} vacancy={vacancy} />
      ))}
    </div>
  );
};

**Пример карточки:**

// frontend/src/features/recruiting/vacancies/components/VacancyCard.tsx
import type { Vacancy } from '../types';

interface VacancyCardProps {
  vacancy: Vacancy;
}

export const VacancyCard = ({ vacancy }: VacancyCardProps) => {
  return (
    <div className="vacancy-card">
      <h3>{vacancy.title}</h3>
      <p>{vacancy.description}</p>
      <div className="vacancy-meta">
        <span>Отдел: {vacancy.department}</span>
        <span>Статус: {vacancy.status}</span>
        {vacancy.salary && (
          <span>
            Зарплата: {vacancy.salary.from} - {vacancy.salary.to} {vacancy.salary.currency}
          </span>
        )}
      </div>
    </div>
  );
};

### Шаг 7: Создание маршрута

\begin{enumerate}
\item \textbf{Создайте файл маршрута}
  \begin{itemize}
  \item Путь: src/routes/recruiting/vacancies.tsx
  \item Используйте TanStack Router
  \end{itemize}

\item \textbf{Экспортируйте Route}
  \begin{itemize}
  \item Определите path, компонент страницы
  \item Добавьте loader, если нужна предзагрузка данных
  \end{itemize}

\item \textbf{Зарегистрируйте маршрут в роутере}
  \begin{itemize}
  \item Откройте src/app/router.tsx (или routes.tsx)
  \item Добавьте импорт и регистрацию маршрута
  \end{itemize}
\end{enumerate}

**Пример:**

// frontend/src/routes/recruiting/vacancies.tsx
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root';
import { VacancyList } from '@/features/recruiting/vacancies/components/VacancyList';

export const vacanciesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recruiting/vacancies',
  component: VacanciesPage,
});

function VacanciesPage() {
  return (
    <div className="page-container">
      <h1>Вакансии</h1>
      <VacancyList />
    </div>
  );
}

### Шаг 8: Добавление в навигацию

\begin{enumerate}
\item \textbf{Откройте файл навигации}
  \begin{itemize}
  \item Путь: shared/components/navigation/Sidebar.tsx (или аналог)
  \end{itemize}

\item \textbf{Добавьте новый пункт меню}
  \begin{itemize}
  \item Определите иконку (из используемой иконочной библиотеки)
  \item Укажите путь (path) и название (label)
  \item Поместите в соответствующий раздел (например, "Рекрутинг")
  \end{itemize}
\end{enumerate}

**Пример:**

// frontend/src/shared/components/navigation/Sidebar.tsx

const navigationItems = [
  // ... существующие пункты
  {
    section: 'Рекрутинг',
    items: [
      {
        path: '/recruiting/vacancies',
        label: 'Вакансии',
        icon: <BriefcaseIcon />,
      },
      {
        path: '/recruiting/hiring-requests',
        label: 'Заявки на подбор',
        icon: <FileTextIcon />,
      },
      {
        path: '/recruiting/candidate-responses',
        label: 'Отклики',
        icon: <InboxIcon />,
      },
      // ... остальные пункты рекрутинга
    ],
  },
  // ... остальные секции
];

### Шаг 9: Тестирование модуля

\begin{enumerate}
\item \textbf{Создайте юнит-тесты для компонентов}
  \begin{itemize}
  \item Путь: features/[module-name]/components/\_\_tests\_\_/
  \item Используйте Vitest + React Testing Library
  \end{itemize}

\item \textbf{Проверьте рендеринг с мок-данными}
  \begin{itemize}
  \item Убедитесь, что компоненты отображаются корректно
  \item Проверьте обработку состояний loading и error
  \end{itemize}

\item \textbf{Запустите приложение и протестируйте вручную}
  \begin{itemize}
  \item Откройте страницу в браузере
  \item Проверьте навигацию, взаимодействие, формы
  \end{itemize}
\end{enumerate}

**Пример теста:**

// frontend/src/features/recruiting/vacancies/components/__tests__/VacancyCard.test.tsx
import { render, screen } from '@testing-library/react';
import { VacancyCard } from '../VacancyCard';
import { mockVacancies } from '../../mocks';

describe('VacancyCard', () => {
  it('renders vacancy title and description', () => {
    render(<VacancyCard vacancy={mockVacancies[0]} />);
    
    expect(screen.getByText('Senior React Developer')).toBeInTheDocument();
    expect(screen.getByText(/Ищем опытного React-разработчика/)).toBeInTheDocument();
  });

  it('displays salary when provided', () => {
    render(<VacancyCard vacancy={mockVacancies[0]} />);
    
    expect(screen.getByText(/200000 - 300000 RUB/)).toBeInTheDocument();
  });
});

### Шаг 10: Коммит и code review

\begin{enumerate}
\item \textbf{Сделайте коммит}
\end{enumerate}

git add .
git commit -m "feat(recruiting): migrate vacancies module from old frontend"

\begin{enumerate}
\setcounter{enumi}{1}
\item \textbf{Создайте Pull Request}
  \begin{itemize}
  \item Опишите, что было перенесено
  \item Приложите скриншоты новой страницы
  \item Укажите ссылки на старый и новый код
  \end{itemize}

\item \textbf{Попросите ревью у команды}
  \begin{itemize}
  \item Проверка на соответствие архитектуре
  \item Проверка типизации и тестов
  \item Проверка UI/UX
  \end{itemize}
\end{enumerate}

---

## Итоговая структура навигации

После завершения миграции навигационное меню будет выглядеть следующим образом:

\begin{itemize}
\item \textbf{Главная} (/)
\item \textbf{Проекты} (/projects)
\item \textbf{Рекрутинг} (новая секция)
  \begin{itemize}
  \item Вакансии (/recruiting/vacancies)
  \item Заявки на подбор (/recruiting/hiring-requests)
  \item Отклики (/recruiting/candidate-responses)
  \item Интервьюеры (/recruiting/interviewers)
  \item Приглашения (/recruiting/invites)
  \end{itemize}
\item \textbf{Календарь} (/calendar)
\item \textbf{Сотрудники} (/employees)
\item \textbf{Финансы} (/finance) — новая секция
\item \textbf{Аналитика} (/analytics)
\item \textbf{Отчёты} (/reporting) — новая секция
\item \textbf{Воркфлоу} (/workflow) — новая секция
\item \textbf{Wiki} (/wiki)
\item \textbf{Инструменты} (новая секция)
  \begin{itemize}
  \item AI Ассистент (/ai/chat)
  \item AI Рекрутер (/ai/recruiter-chat)
  \item Глобальный поиск (Cmd+K)
  \end{itemize}
\item \textbf{Интеграции} (новая секция)
  \begin{itemize}
  \item Huntflow (/recruiting/huntflow)
  \item Telegram (/integrations/telegram)
  \end{itemize}
\item \textbf{Настройки} (/settings)
  \begin{itemize}
  \item Настройки компании (/company-settings)
  \item Специализации (/settings/specializations)
  \end{itemize}
\item \textbf{Профиль} (/profile)
\item \textbf{Админ-панель} (/admin) — для администраторов
\end{itemize}

---

## Чек-лист миграции одного модуля

Используйте этот чек-лист для каждого переносимого модуля:

\begin{itemize}
\item[$\square$] Изучены типы данных в старом проекте
\item[$\square$] Создан types.ts в новом проекте
\item[$\square$] Создан mocks.ts с 5-10 объектами
\item[$\square$] Создана структура папок (components, hooks, store)
\item[$\square$] Создан api.ts с мок-функциями
\item[$\square$] Создан Zustand store с actions
\item[$\square$] Перенесены и адаптированы компоненты
\item[$\square$] Заменены UI-библиотеки на Radix UI
\item[$\square$] Создан маршрут в routes/
\item[$\square$] Добавлен пункт в навигацию
\item[$\square$] Написаны юнит-тесты
\item[$\square$] Проведено ручное тестирование
\item[$\square$] Сделан коммит и создан PR
\item[$\square$] Пройден code review
\item[$\square$] Смёржен в основную ветку
\end{itemize}

---

## Частые проблемы и решения

### Проблема 1: Конфликт типов

**Симптом:** TypeScript ругается на несоответствие типов из старого и нового проекта.

**Решение:**
\begin{itemize}
\item Не копируйте типы напрямую
\item Адаптируйте типы под новую структуру данных
\item Используйте Utility Types (Partial, Pick, Omit) для трансформации
\end{itemize}

### Проблема 2: Сломанные импорты

**Симптом:** Ошибки "Module not found" при сборке.

**Решение:**
\begin{itemize}
\item Проверьте алиасы в vite.config.ts (должен быть \@ → src/)
\item Используйте абсолютные импорты через \@
\item Не импортируйте напрямую из других фич — только через shared/
\end{itemize}

### Проблема 3: Стили не применяются

**Симптом:** Компоненты отображаются без стилей или криво.

**Решение:**
\begin{itemize}
\item Проверьте, что CSS-модули подключены (файл .module.css)
\item Убедитесь, что Radix UI Primitives установлены
\item Проверьте глобальные стили в app/styles/
\end{itemize}

### Проблема 4: Ошибки в консоли браузера

**Симптом:** React warnings или ошибки рендеринга.

**Решение:**
\begin{itemize}
\item Проверьте, что все компоненты возвращают JSX
\item Убедитесь, что key проставлены в списках
\item Проверьте, что хуки вызываются на верхнем уровне компонента
\end{itemize}

### Проблема 5: Данные не загружаются

**Симптом:** Компонент показывает loading или пустой список.

**Решение:**
\begin{itemize}
\item Проверьте, что fetchData вызывается в useEffect
\item Убедитесь, что мок-функции возвращают Promise
\item Проверьте, что store правильно обновляет состояние
\end{itemize}

---

## Приоритизация миграции

Рекомендуемая последовательность миграции модулей:

\begin{enumerate}
\item \textbf{Неделя 1-2: Рекрутинг (критичные модули)}
  \begin{itemize}
  \item Вакансии
  \item Заявки на подбор
  \item Отклики кандидатов
  \end{itemize}

\item \textbf{Неделя 3: Рекрутинг (дополнительные модули)}
  \begin{itemize}
  \item Интервьюеры
  \item Приглашения
  \item Huntflow интеграция
  \end{itemize}

\item \textbf{Неделя 4: Бизнес-модули}
  \begin{itemize}
  \item Финансы
  \item Отчётность
  \item Специализации
  \end{itemize}

\item \textbf{Неделя 5: Дополнительные модули}
  \begin{itemize}
  \item AI Chat
  \item Recruiter Chat
  \item Telegram
  \item Workflow
  \end{itemize}

\item \textbf{Неделя 6: UI-компоненты}
  \begin{itemize}
  \item GlobalSearch
  \item FloatingActions
  \item StatusBar
  \item Остальные общие компоненты
  \end{itemize}
\end{enumerate}

---

## Заключение

Этот документ содержит полную инструкцию по миграции функциональности из старого проекта в новый. Следуя пошаговым инструкциям, вы сможете перенести все необходимые модули с соблюдением архитектуры нового проекта.

Ключевые принципы:
\begin{itemize}
\item Не копируйте код напрямую — адаптируйте под новую архитектуру
\item Используйте мок-данные на первом этапе
\item Соблюдайте DRY и SOLID
\item Пишите тесты для каждого модуля
\item Делайте небольшие коммиты и регулярные code review
\end{itemize}

При возникновении вопросов обращайтесь к разделу "Частые проблемы и решения" или к команде разработки.