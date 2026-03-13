import type { Preview } from '@storybook/react'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import '../src/shared/styles/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1c1c1f' },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.backgrounds?.value === '#1c1c1f'
      return (
        <Theme appearance={isDark ? 'dark' : 'light'} accentColor="crimson">
          <Story />
        </Theme>
      )
    },
  ],
}

export default preview
