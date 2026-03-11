export interface Variable {
  key: string
  value: string
  category: string
  label: string
}

export interface VariableOption {
  key: string
  label: string
  category: string
  defaultValue: string
}

export const AVAILABLE_VARIABLES: VariableOption[] = [
  { key: '{company_name}', label: 'Название компании', category: 'Компания и вакансия', defaultValue: 'ООО "Компания"' },
  { key: '{vacancy_name}', label: 'Название вакансии', category: 'Компания и вакансия', defaultValue: 'Frontend Developer' },
  { key: '{salary_before_tax}', label: 'Сумма на ИС (до вычета налогов)', category: 'Условия оффера', defaultValue: '200,000' },
  { key: '{salary_after_tax}', label: 'Сумма после ИС (после вычета налогов)', category: 'Условия оффера', defaultValue: '174,000' },
  { key: '{bonus}', label: 'Премия', category: 'Условия оффера', defaultValue: '50,000' },
  { key: '{special_conditions}', label: 'Специфические условия', category: 'Условия оффера', defaultValue: 'Удаленная работа, гибкий график' },
  { key: '{salary_type}', label: 'Нет/Гросс', category: 'Условия оффера', defaultValue: 'Нет' },
  { key: '{currency}', label: 'Валюта', category: 'Условия оффера', defaultValue: 'RUB' },
  { key: '{candidate_name}', label: 'ФИО кандидата', category: 'Кандидат', defaultValue: 'Иван Иванов' },
  { key: '{start_date}', label: 'Дата старта', category: 'Кандидат', defaultValue: '01.02.2026' },
  { key: '{location}', label: 'Локация', category: 'Кандидат', defaultValue: 'Москва' },
  { key: '{recruiter_name}', label: 'ФИО рекрутера', category: 'Рекрутер', defaultValue: 'Петр Петров' },
  { key: '{recruiter_first_name}', label: 'Имя рекрутера', category: 'Рекрутер', defaultValue: 'Петр' },
  { key: '{recruiter_phone}', label: 'Телефон рекрутера', category: 'Рекрутер', defaultValue: '+7 (999) 123-45-67' },
  { key: '{recruiter_email}', label: 'Почта рекрутера', category: 'Рекрутер', defaultValue: 'recruiter@company.com' },
  { key: '{recruiter_telegram}', label: 'Телеграм рекрутера', category: 'Рекрутер', defaultValue: '@recruiter' },
  { key: '{recruiter_linkedin}', label: 'Линкедин рекрутера', category: 'Рекрутер', defaultValue: 'linkedin.com/in/recruiter' },
  { key: '{generation_date}', label: 'Дата формирования', category: 'Системные', defaultValue: new Date().toLocaleDateString('ru-RU') },
]
