import type { WorkItemDomain, WorkItemSchemaSection } from './types'

export const WORK_ITEM_FIELD_SCHEMAS: Partial<Record<WorkItemDomain, { sections: WorkItemSchemaSection[] }>> = {
  candidate: {
    sections: [
      {
        key: 'profile',
        label: 'Профиль кандидата',
        fields: [
          { key: 'position', label: 'Позиция', type: 'text', placeholder: 'Frontend Developer' },
          { key: 'currentCompany', label: 'Компания', type: 'text', placeholder: 'Текущее место работы' },
          { key: 'salary', label: 'Ожидание (USD)', type: 'text', placeholder: '3000–4500' },
          { key: 'location', label: 'Локация', type: 'text', placeholder: 'Минск / Remote' },
        ],
      },
      { key: 'skills', label: 'Стек', type: 'tags', tags: ['React', 'TypeScript', 'Node.js'] },
      {
        key: 'source',
        label: 'Источник',
        fields: [
          {
            key: 'sourceType',
            label: 'Откуда',
            type: 'select',
            options: ['LinkedIn', 'HH.ru', 'Referral', 'Huntflow', 'Direct'],
          },
          { key: 'sourceUrl', label: 'Ссылка', type: 'text', placeholder: 'linkedin.com/in/...' },
        ],
      },
    ],
  },
  vacancy: {
    sections: [
      {
        key: 'vacancy-details',
        label: 'Параметры вакансии',
        fields: [
          { key: 'department', label: 'Отдел', type: 'text', placeholder: 'Engineering' },
          {
            key: 'grade',
            label: 'Грейд',
            type: 'select',
            options: ['Junior', 'Middle', 'Senior', 'Lead', 'Principal'],
          },
          { key: 'budget', label: 'Бюджет (USD)', type: 'text', placeholder: '3000–5000' },
          { key: 'deadline', label: 'Закрыть до', type: 'date' },
        ],
      },
    ],
  },
  hiring_request: {
    sections: [
      {
        key: 'hr',
        label: 'Заявка (HR Helper)',
        fields: [
          { key: 'role', label: 'Роль', type: 'text', placeholder: 'Support Engineer' },
          {
            key: 'urgency',
            label: 'Срочность',
            type: 'select',
            options: ['Стандарт', 'Высокая', 'Критичная'],
          },
          { key: 'requester', label: 'Заказчик', type: 'text', placeholder: 'Дирекция продукта' },
          { key: 'targetDate', label: 'Целевая дата', type: 'date' },
        ],
      },
    ],
  },
  project: {
    sections: [
      {
        key: 'overview',
        label: 'Обзор проекта',
        fields: [
          { key: 'goal', label: 'Цель', type: 'text', placeholder: 'Что нужно достичь' },
          { key: 'dueDate', label: 'Дедлайн', type: 'date' },
          {
            key: 'health',
            label: 'Статус',
            type: 'select',
            options: ['On Track', 'At Risk', 'Off Track', 'Completed'],
          },
        ],
      },
      { key: 'team', label: 'Команда', type: 'tags', tags: ['Алексей К.', 'Мария В.'] },
    ],
  },
  event: {
    sections: [
      {
        key: 'timing',
        label: 'Время события',
        fields: [
          { key: 'startDate', label: 'Начало', type: 'datetime-local' },
          { key: 'endDate', label: 'Конец', type: 'datetime-local' },
          { key: 'location', label: 'Место', type: 'text', placeholder: 'Google Meet / Офис' },
        ],
      },
      { key: 'attendees', label: 'Участники', type: 'tags', tags: ['Алексей К.', 'Иван С.'] },
    ],
  },
  meet: {
    sections: [
      {
        key: 'meet',
        label: 'Внутренний мит',
        fields: [
          { key: 'room', label: 'Комната / ссылка', type: 'text', placeholder: '/meet/room?…' },
          { key: 'agenda', label: 'Повестка', type: 'text', placeholder: 'Q1 hiring review' },
          {
            key: 'record',
            label: 'Запись',
            type: 'select',
            options: ['Не требуется', 'Включена', 'По запросу'],
          },
        ],
      },
    ],
  },
  wiki: {
    sections: [
      {
        key: 'meta',
        label: 'Метаданные',
        fields: [
          {
            key: 'contentType',
            label: 'Тип',
            type: 'select',
            options: ['Процесс', 'Руководство', 'FAQ', 'Шаблон', 'Политика'],
          },
          { key: 'reviewDate', label: 'Ревью до', type: 'date' },
          { key: 'owner', label: 'Владелец', type: 'text', placeholder: 'Ответственный' },
        ],
      },
    ],
  },
  specialist: {
    sections: [
      {
        key: 'info',
        label: 'О специалисте',
        fields: [
          { key: 'specialization', label: 'Специализация', type: 'text', placeholder: 'Senior Frontend Dev' },
          { key: 'rate', label: 'Ставка (USD/мес)', type: 'text', placeholder: '4000–5500' },
          {
            key: 'availability',
            label: 'Доступность',
            type: 'select',
            options: ['Доступен', 'Занят', 'Скоро свободен', 'Уточнить'],
          },
        ],
      },
      { key: 'skills', label: 'Стек', type: 'tags', tags: ['Vue.js', 'Python', 'AWS'] },
    ],
  },
  integration: {
    sections: [
      {
        key: 'conn',
        label: 'Интеграция',
        fields: [
          {
            key: 'provider',
            label: 'Провайдер',
            type: 'select',
            options: ['Huntflow', 'n8n', 'Telegram', 'HH.ru', 'Notion', 'Custom webhook'],
          },
          { key: 'endpoint', label: 'Endpoint / workspace', type: 'text', placeholder: 'https://…' },
          {
            key: 'health',
            label: 'Состояние',
            type: 'select',
            options: ['Активна', 'Деградация', 'Отключена', 'Черновик'],
          },
        ],
      },
    ],
  },
  report: {
    sections: [
      {
        key: 'rpt',
        label: 'Отчётность',
        fields: [
          {
            key: 'kind',
            label: 'Тип отчёта',
            type: 'select',
            options: ['Подбор', 'План найма', 'Бенчмарки', 'Компания', 'Пользовательский'],
          },
          { key: 'period', label: 'Период', type: 'text', placeholder: 'Q1 2026' },
          { key: 'owner', label: 'Владелец', type: 'text', placeholder: 'HR BP' },
        ],
      },
    ],
  },
}
