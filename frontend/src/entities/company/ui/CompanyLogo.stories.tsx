import type { Meta, StoryObj } from '@storybook/react'
import { CompanyLogo } from './CompanyLogo'

const meta = {
  title: 'Entities/Company/CompanyLogo',
  component: CompanyLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof CompanyLogo>

export default meta
type Story = StoryObj<typeof meta>

export const WithInitials: Story = {
  args: {
    name: 'HR Helper',
  },
}

export const SingleWord: Story = {
  args: {
    name: 'Acme',
  },
}

export const LongName: Story = {
  args: {
    name: 'Very Long Company Name Inc',
  },
}

export const SmallSize: Story = {
  args: {
    name: 'HR Helper',
    size: 'sm',
  },
}

export const MediumSize: Story = {
  args: {
    name: 'HR Helper',
    size: 'md',
  },
}

export const LargeSize: Story = {
  args: {
    name: 'HR Helper',
    size: 'lg',
  },
}

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <CompanyLogo name="HR Helper" size="sm" />
      <CompanyLogo name="HR Helper" size="md" />
      <CompanyLogo name="HR Helper" size="lg" />
    </div>
  ),
}
