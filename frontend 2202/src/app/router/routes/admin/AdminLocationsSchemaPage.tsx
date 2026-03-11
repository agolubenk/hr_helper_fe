import { Box, Text } from '@radix-ui/themes'
import { FieldSchemaTable } from '@/shared/components/admin/FieldSchemaTable'

const LOCATION_FIELDS = [
  ['name', 'string', 'Название'],
  ['address', 'string', 'Адрес'],
  ['country', 'string', 'Страна'],
  ['city', 'string', 'Город'],
  ['mapLink', 'url', 'Ссылка на карту'],
  ['directions', 'string', 'Как добраться'],
  ['description', 'string', 'Описание'],
  ['is_main', 'boolean', 'Главный офис'],
].map(([field, type, desc]) => ({ field: field as string, type: type as string, desc: desc as string }))

export function AdminLocationsSchemaPage() {
  return (
    <Box>
      <Text size="6" weight="bold" mb="4" style={{ display: 'block' }}>
        Схема полей: Location
      </Text>
      <FieldSchemaTable title="Location" fields={LOCATION_FIELDS} />
    </Box>
  )
}
