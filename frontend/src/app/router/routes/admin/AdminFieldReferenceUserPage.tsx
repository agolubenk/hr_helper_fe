import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const USER_FIELDS = [
  ['employee_id', 'string', 'Табельный номер'],
  ['first_name', 'string', 'Имя'],
  ['last_name', 'string', 'Фамилия'],
  ['email', 'string', 'Email'],
  ['phone', 'string', 'Телефон'],
  ['lifecycle_state', 'FSM', 'CANDIDATE → … → ALUMNI'],
  ['department', 'FK', 'Отдел'],
  ['position', 'FK', 'Должность'],
  ['manager', 'FK User', 'Руководитель'],
  ['location', 'FK', 'Локация'],
  ['timezone', 'string', 'Часовой пояс'],
  ['hire_date', 'date', 'Дата найма'],
  ['probation_end_date', 'date', 'Конец испытательного'],
  ['contract_end_date', 'date', 'Конец контракта'],
  ['separation_date', 'date', 'Дата увольнения'],
  ['is_interviewer', 'boolean', 'Интервьюер'],
  ['avatar', 'image', 'Аватар'],
  ['created_at', 'datetime', 'Дата создания (read-only)'],
  ['custom_attributes', 'JSON', 'Доп. поля'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminFieldReferenceUserPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Справочник полей: User
      </Text>
      <FieldSchemaTable title="User" fields={USER_FIELDS} />
    </Box>
  )
}
