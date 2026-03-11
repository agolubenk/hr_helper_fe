import { Box, Table, Text, Badge } from '@radix-ui/themes'

interface FieldRow {
  field: string
  type: string
  desc: string
}

interface FieldSchemaTableProps {
  title: string
  fields: FieldRow[]
}

export function FieldSchemaTable({ title, fields }: FieldSchemaTableProps) {
  return (
    <Box>
      <Text size="3" weight="bold" mb="2">
        {title}
      </Text>
      <Table.Root size="1">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Поле</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Тип</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Описание</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {fields.map(({ field, type, desc }) => (
            <Table.Row key={field}>
              <Table.Cell>
                <Text size="2" style={{ fontFamily: 'monospace' }}>
                  {field}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Badge size="1" color="gray">
                  {type}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Text size="2" color="gray">
                  {desc}
                </Text>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}
