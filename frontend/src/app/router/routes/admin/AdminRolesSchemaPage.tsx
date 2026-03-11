import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const ROLE_FIELDS = [
  ['user', 'FK User', 'Пользователь'],
  ['role_type', 'choice', 'EMPLOYEE, CANDIDATE, INTERVIEWER, ADMIN'],
  ['context', 'choice', 'global, department, project'],
  ['context_id', 'FK', 'ID контекста'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminRolesSchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема полей: UserRole
      </Text>
      <FieldSchemaTable title="UserRole" fields={ROLE_FIELDS} />
    </Box>
  )
}
