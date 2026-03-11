import { Flex, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'

interface PlaceholderPageProps {
  title?: string
}

export function PlaceholderPage({ title = 'Раздел в разработке' }: PlaceholderPageProps) {
  return (
    <Flex direction="column" gap="3" align="center" justify="center" style={{ minHeight: 200 }}>
      <Text size="4" weight="medium">{title}</Text>
      <Link to="/">
        <Text size="2" color="blue" style={{ textDecoration: 'underline' }}>На главную</Text>
      </Link>
    </Flex>
  )
}
