import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const DEPARTMENT_FIELDS = [
  ['name', 'string', 'Название'],
  ['slug', 'string', 'Slug'],
  ['short_name', 'string', 'Краткое название'],
  ['parent', 'FK', 'Родительский отдел'],
  ['manager', 'FK User', 'Руководитель'],
  ['location', 'FK Location', 'Локация'],
  ['description', 'string', 'Описание'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminDepartmentsSchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема полей: Department
      </Text>
      <FieldSchemaTable title="Department" fields={DEPARTMENT_FIELDS} />
    </Box>
  )
}
