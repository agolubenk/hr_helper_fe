export interface AtsCandidate {
  id: string
  name: string
  vacancy: string
  stage: string
  status: 'new' | 'in_progress' | 'offer' | 'rejected'
  source: string
}

export interface AtsAssessment {
  id: string
  date: string
  interviewer: string
  score: number
  maxScore: number
  summary: string
}

export const ATS_CANDIDATES: AtsCandidate[] = [
  { id: '1', name: 'John Doe', vacancy: 'Frontend Senior', stage: 'Tech interview', status: 'in_progress', source: 'LinkedIn' },
  { id: '2', name: 'Alice Brown', vacancy: 'Frontend Senior', stage: 'HR screening', status: 'new', source: 'Telegram' },
  { id: '3', name: 'Mark Lee', vacancy: 'Backend Developer', stage: 'Offer', status: 'offer', source: 'Referral' },
  { id: '4', name: 'Emma White', vacancy: 'Backend Developer', stage: 'Final interview', status: 'in_progress', source: 'hh.ru' },
]

export const ATS_VACANCIES: Array<{ id: string; title: string }> = [
  { id: '1', title: 'Frontend Senior' },
  { id: '2', title: 'Backend Developer' },
]

export const ATS_ASSESSMENTS_BY_CANDIDATE: Record<string, AtsAssessment[]> = {
  '1': [
    { id: 'a-101', date: '2026-03-01', interviewer: 'Иван Петров', score: 4.2, maxScore: 5, summary: 'Сильный React/TS профиль.' },
    { id: 'a-102', date: '2026-03-04', interviewer: 'Алексей Смирнов', score: 4.6, maxScore: 5, summary: 'Хорошая архитектурная подготовка.' },
  ],
  '2': [{ id: 'a-201', date: '2026-03-02', interviewer: 'Мария Козлова', score: 3.9, maxScore: 5, summary: 'Нужен рост по system design.' }],
  '3': [{ id: 'a-301', date: '2026-03-03', interviewer: 'CTO', score: 4.8, maxScore: 5, summary: 'Рекомендован к офферу.' }],
  '4': [],
}

export function getVacancyIdByTitle(title: string): string {
  return ATS_VACANCIES.find((x) => x.title === title)?.id ?? ATS_VACANCIES[0].id
}
