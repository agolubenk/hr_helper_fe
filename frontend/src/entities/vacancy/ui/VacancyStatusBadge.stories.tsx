import type { Meta, StoryObj } from '@storybook/react'
import { VacancyStatusBadge } from './VacancyStatusBadge'

const meta = {
  title: 'Entities/Vacancy/VacancyStatusBadge',
  component: VacancyStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['active', 'inactive', 'draft', 'archived'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
} satisfies Meta<typeof VacancyStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Active: Story = {
  args: {
    status: 'active',
  },
}

export const Inactive: Story = {
  args: {
    status: 'inactive',
  },
}

export const Draft: Story = {
  args: {
    status: 'draft',
  },
}

export const Archived: Story = {
  args: {
    status: 'archived',
  },
}

export const MediumSize: Story = {
  args: {
    status: 'active',
    size: 'md',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <VacancyStatusBadge status="active" />
      <VacancyStatusBadge status="inactive" />
      <VacancyStatusBadge status="draft" />
      <VacancyStatusBadge status="archived" />
    </div>
  ),
}
