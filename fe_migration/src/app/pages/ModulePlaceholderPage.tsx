/**
 * Заглушка для маршрутов из сайдбара/меню, у которых ещё нет отдельной страницы.
 * Показывает текущий путь и не даёт пользователю «пустой» 404 по ошибке конфигурации.
 */

import { Box, Text } from '@radix-ui/themes'
import { useLocation } from '@/router-adapter'

export function ModulePlaceholderPage() {
  const { pathname } = useLocation()

  return (
    <Box p="6" style={{ maxWidth: 640 }}>
      <Text size="5" weight="bold" mb="2" as="p">
        Раздел в разработке
      </Text>
      <Text size="3" color="gray" mb="3" as="p">
        Маршрут зарезервирован; полноценный экран появится при подключении домена к API или отдельной
        задаче на UI.
      </Text>
      <Text
        size="2"
        as="p"
        style={{
          fontFamily: 'var(--code-font-family, ui-monospace, monospace)',
          wordBreak: 'break-all',
          color: 'var(--gray-11)',
        }}
      >
        {pathname}
      </Text>
    </Box>
  )
}
