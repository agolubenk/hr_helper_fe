import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const GRADE_FIELDS = [
  ['name', 'string', 'Название'],
  ['level', 'integer', 'Уровень'],
  ['description', 'string', 'Описание'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminGradesSchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема полей: Grade
      </Text>
      <FieldSchemaTable title="Grade" fields={GRADE_FIELDS} />
    </Box>
  )
}
