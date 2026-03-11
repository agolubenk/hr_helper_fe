import { Box, Text } from '@radix-ui/themes'

/**
 * Страница AI Рекрутер (Recruiter Chat).
 * Полная миграция из frontend old app/recr-chat/ — в планах (модуль объёмный).
 */
export function RecruiterChatPage() {
  return (
    <Box style={{ padding: '0 24px' }}>
      <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
        AI Рекрутер
      </Text>
      <Text size="2" color="gray" style={{ display: 'block' }}>
        Здесь будет интерфейс чата с AI-рекрутером: выбор вакансии, список кандидатов, карточка кандидата и ассессменты. Модуль из frontend old (app/recr-chat/) будет перенесён отдельно.
      </Text>
    </Box>
  )
}
