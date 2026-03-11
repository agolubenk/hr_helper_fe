import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const POSITION_FIELDS = [
  ['name', 'string', 'Название должности'],
  ['department', 'FK Department', 'Отдел'],
  ['grade', 'FK Grade', 'Грейд'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminPositionsSchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема полей: Position
      </Text>
      <FieldSchemaTable title="Position" fields={POSITION_FIELDS} />
    </Box>
  )
}
