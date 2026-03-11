export interface HuntflowOrg {
  id: number
  name: string
}

export interface OurOffice {
  id: string
  name: string
}

export interface Stage {
  id: string
  name: string
}

export interface HuntflowStage {
  id: number
  name: string
}

export interface RejectionReason {
  id: string
  name: string
}

export interface HuntflowRejectionReason {
  id: number
  name: string
}

export interface CandidateField {
  id: string
  name: string
}

export interface HuntflowField {
  id: number
  name: string
}

export interface Source {
  id: string
  name: string
}

export interface HuntflowSource {
  id: number
  name: string
}

export const MOCK_HUNTFLOW_ORGS: HuntflowOrg[] = [{ id: 291341, name: 'Softnetix' }]

export const MOCK_OUR_OFFICES: OurOffice[] = [
  { id: '1', name: 'Офис Минск' },
  { id: '2', name: 'Офис Варшава' },
]

export const MOCK_OUR_STAGES: Stage[] = [
  { id: '1', name: 'Заявка' },
  { id: '2', name: 'Скрининг' },
  { id: '3', name: 'Интервью' },
  { id: '4', name: 'Оффер' },
  { id: '5', name: 'Принят' },
  { id: '6', name: 'Отказ' },
]

export const MOCK_HUNTFLOW_STAGES: HuntflowStage[] = [
  { id: 101, name: 'Новый' },
  { id: 102, name: 'Скрининг' },
  { id: 103, name: 'Интервью' },
  { id: 104, name: 'Оффер' },
  { id: 105, name: 'Принят' },
  { id: 106, name: 'Отказ' },
  { id: 107, name: 'Архив' },
]

export const MOCK_OUR_REJECTION_REASONS: RejectionReason[] = [
  { id: 'r1', name: 'Не подходит по опыту' },
  { id: 'r2', name: 'Зарплатные ожидания' },
  { id: 'r3', name: 'Другая причина' },
]

export const MOCK_HF_REJECTION_REASONS: HuntflowRejectionReason[] = [
  { id: 201, name: 'Опыт не подходит' },
  { id: 202, name: 'ЗП' },
  { id: 203, name: 'Кандидат отказался' },
  { id: 204, name: 'Прочее' },
]

export const MOCK_OUR_FIELDS: CandidateField[] = [
  { id: 'f1', name: 'Ожидания по ЗП' },
  { id: 'f2', name: 'Источник' },
  { id: 'f3', name: 'Готовность к релокации' },
  { id: 'f4', name: 'Грейд' },
]

export const MOCK_HF_FIELDS: HuntflowField[] = [
  { id: 301, name: 'Ожидания по ЗП' },
  { id: 302, name: 'Источник' },
  { id: 303, name: 'Релокация' },
  { id: 304, name: 'Уровень' },
  { id: 305, name: 'Ссылка на портфолио' },
  { id: 306, name: 'Комментарий рекрутера' },
]

export const MOCK_OUR_SOURCES: Source[] = [
  { id: 's1', name: 'hh.ru' },
  { id: 's2', name: 'Рекомендация' },
  { id: 's3', name: 'Прямой отклик' },
]

export const MOCK_HF_SOURCES: HuntflowSource[] = [
  { id: 401, name: 'HeadHunter' },
  { id: 402, name: 'Рекомендация сотрудника' },
  { id: 403, name: 'Сайт компании' },
  { id: 404, name: 'LinkedIn' },
  { id: 405, name: 'Другое' },
]

export function saveHuntflowMappingsMock(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 500))
}

