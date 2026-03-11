import { Box, Flex, Text, Card } from '@radix-ui/themes'
import { Link } from '@tanstack/react-router'

export function AdminFieldReferencePage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Справочник полей (архитектура)
      </Text>
      <Text size="3" color="gray" mb="4" style={{ display: 'block' }}>
        Выберите модель для просмотра схемы полей.
      </Text>
      <Flex gap="4" wrap="wrap">
        <Card asChild>
          <Link to="/admin/field-reference/company" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box p="4" style={{ minWidth: 200 }}>
              <Text size="4" weight="bold">Company</Text>
              <Text size="2" color="gray" style={{ display: 'block', marginTop: 4 }}>
                Настройки компании
              </Text>
            </Box>
          </Link>
        </Card>
        <Card asChild>
          <Link to="/admin/field-reference/user" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box p="4" style={{ minWidth: 200 }}>
              <Text size="4" weight="bold">User</Text>
              <Text size="2" color="gray" style={{ display: 'block', marginTop: 4 }}>
                Пользователь / сотрудник
              </Text>
            </Box>
          </Link>
        </Card>
      </Flex>
    </Box>
  )
}
