import { Box, Text } from '@radix-ui/themes'
import { PlaceholderPage } from '../PlaceholderPage'

interface AdminPlaceholderPageProps {
  title: string
  description?: string
}

export function AdminPlaceholderPage({ title, description }: AdminPlaceholderPageProps) {
  return (
    <Box>
      <Text size="6" weight="bold" mb="2" style={{ display: 'block' }}>
        {title}
      </Text>
      {description && (
        <Text size="3" color="gray" mb="4" style={{ display: 'block' }}>
          {description}
        </Text>
      )}
      <PlaceholderPage title={description ?? title} />
    </Box>
  )
}
