import type { Meta, StoryObj } from '@storybook/react'
import { CompanyPlanBadge } from './CompanyPlanBadge'

const meta = {
  title: 'Entities/Company/CompanyPlanBadge',
  component: CompanyPlanBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    plan: {
      control: 'select',
      options: ['free', 'starter', 'professional', 'enterprise'],
    },
  },
} satisfies Meta<typeof CompanyPlanBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Free: Story = {
  args: {
    plan: 'free',
  },
}

export const Starter: Story = {
  args: {
    plan: 'starter',
  },
}

export const Professional: Story = {
  args: {
    plan: 'professional',
  },
}

export const Enterprise: Story = {
  args: {
    plan: 'enterprise',
  },
}

export const AllPlans: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <CompanyPlanBadge plan="free" />
      <CompanyPlanBadge plan="starter" />
      <CompanyPlanBadge plan="professional" />
      <CompanyPlanBadge plan="enterprise" />
    </div>
  ),
}
