import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const COMPANY_FIELDS = [
  ['name', 'string', 'Название компании'],
  ['legal_name', 'string', 'Юридическое название'],
  ['tax_id', 'string', 'ИНН / Tax ID'],
  ['headquarters_country', 'ISO 3166-1', 'Страна'],
  ['headquarters_city', 'string', 'Город'],
  ['timezone', 'IANA', 'Часовой пояс'],
  ['industry', 'string', 'Отрасль'],
  ['company_size', 'integer', 'Численность'],
  ['fiscal_year_start', 'date', 'Начало фин. года'],
  ['default_work_schedule', 'choice', 'full-time / part-time'],
  ['probation_period_days', 'integer', 'Испытательный срок'],
  ['notice_period_days', 'integer', 'Срок уведомления'],
  ['logo', 'image', 'Логотип'],
  ['is_active', 'boolean', 'Активна'],
  ['custom_attributes', 'JSON', 'Доп. поля'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminCompanySchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема полей: Company
      </Text>
      <FieldSchemaTable title="Company" fields={COMPANY_FIELDS} />
    </Box>
  )
}
