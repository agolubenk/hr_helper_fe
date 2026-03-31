import { Box, Text } from '@radix-ui/themes'

/** Краткое описание модели RBAC — только на странице «Роли и права». */
export function RbacAccessModelIntro() {
  return (
    <Box mb="5">
      <Text size="2" color="gray" style={{ display: 'block', maxWidth: '72ch', lineHeight: 1.55 }}>
        Связка модели доступа: <strong>пользователи</strong> входят в <strong>группы</strong> и получают{' '}
        <strong>роли</strong>; роли агрегируют атомарные <strong>права</strong> на ресурсы (матрица). Реестр
        прав — полный каталог разрешений для аудита и интеграций.
      </Text>
    </Box>
  )
}
