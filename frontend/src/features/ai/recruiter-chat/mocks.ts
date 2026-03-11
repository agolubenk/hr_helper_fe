export interface RecrChatVacancy {
  id: string
  title: string
}

export interface RecrChatCandidate {
  id: string
  name: string
  position?: string
  stage?: string
}

export const MOCK_VACANCIES: RecrChatVacancy[] = [
  { id: '1', title: 'Frontend Senior' },
  { id: '2', title: 'Backend Developer' },
  { id: '3', title: 'Product Designer' },
]

export const MOCK_CANDIDATES_BY_VACANCY: Record<string, RecrChatCandidate[]> = {
  '1': [
    { id: '1', name: 'Иван Петров', position: 'Frontend Developer', stage: 'HR Screening' },
    { id: '2', name: 'Мария Сидорова', position: 'React Developer', stage: 'Interview' },
    { id: '3', name: 'Алексей Козлов', position: 'Senior Frontend', stage: 'Offer' },
  ],
  '2': [
    { id: '4', name: 'Ольга Новикова', position: 'Backend Dev', stage: 'New' },
    { id: '5', name: 'Дмитрий Волков', position: 'Python Developer', stage: 'Tech Screening' },
  ],
  '3': [
    { id: '6', name: 'Елена Соколова', position: 'UI/UX Designer', stage: 'Contact' },
  ],
}

export function getCandidatesForVacancy(vacancyId: string): RecrChatCandidate[] {
  return MOCK_CANDIDATES_BY_VACANCY[vacancyId] ?? []
}
