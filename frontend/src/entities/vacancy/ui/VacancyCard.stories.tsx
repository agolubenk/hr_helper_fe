import type { Meta, StoryObj } from '@storybook/react'
import { VacancyCard } from './VacancyCard'

const meta = {
  title: 'Entities/Vacancy/VacancyCard',
  component: VacancyCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof VacancyCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    vacancy: {
      id: 1,
      title: 'Frontend Developer',
      status: 'active',
      recruiterName: 'John Doe',
      locations: ['Минск', 'Удалённо'],
      interviewersCount: 3,
      date: '25.10.2025',
      hasWarning: false,
    },
  },
}

export const WithWarning: Story = {
  args: {
    vacancy: {
      id: 2,
      title: 'Backend Developer',
      status: 'inactive',
      recruiterName: 'Jane Smith',
      locations: ['Варшава'],
      interviewersCount: 0,
      date: '20.10.2025',
      hasWarning: true,
      warningText: 'Зарплатные вилки не установлены',
    },
  },
}

export const Selected: Story = {
  args: {
    vacancy: {
      id: 3,
      title: 'DevOps Engineer',
      status: 'active',
      recruiterName: 'John Doe',
      locations: ['Минск', 'Удалённо', 'Польша'],
      interviewersCount: 2,
      date: null,
      hasWarning: false,
    },
    selected: true,
  },
}

export const NoLocations: Story = {
  args: {
    vacancy: {
      id: 4,
      title: 'QA Engineer',
      status: 'draft',
      recruiterName: 'Jane Smith',
      locations: [],
      interviewersCount: 0,
      date: null,
      hasWarning: false,
    },
  },
}

export const Inactive: Story = {
  args: {
    vacancy: {
      id: 5,
      title: 'Project Manager',
      status: 'inactive',
      recruiterName: 'John Doe',
      locations: ['Минск'],
      interviewersCount: 1,
      date: '15.10.2025',
      hasWarning: false,
    },
  },
}

export const Archived: Story = {
  args: {
    vacancy: {
      id: 6,
      title: 'UX Designer',
      status: 'archived',
      recruiterName: 'Jane Smith',
      locations: ['Удалённо'],
      interviewersCount: 0,
      date: '01.09.2025',
      hasWarning: false,
    },
  },
}
