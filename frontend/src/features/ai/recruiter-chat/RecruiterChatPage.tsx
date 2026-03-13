import { Box, Text } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'

/**
 * Страница обзора AI Рекрутер.
 * Основная функциональность ATS перенесена в /ats.
 */
export function RecruiterChatPage() {
  return (
    <Box style={{ padding: '0 24px' }}>
      <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
        AI Рекрутер
      </Text>
      <Text size="2" color="gray" style={{ display: 'block', marginBottom: 16 }}>
        Обзорная страница AI Рекрутера. Основной функционал ATS доступен по ссылке ниже.
      </Text>
      <Link to="/ats" style={{ color: 'var(--accent-9)' }}>
        Перейти в ATS | Talent Pool →
      </Link>
    </Box>
  )
}
