/**
 * Пример админки — все поля Company и User по архитектуре
 */
import { Box, Flex, Text, Card, Tabs, Table, Badge } from '@radix-ui/themes'
import { useState } from 'react'
import GeneralSettings from '@/shared/components/company-settings/GeneralSettings'
import UsersSettings from '@/shared/components/company-settings/UsersSettings'

export function AdminPage() {
  const [activeTab, setActiveTab] = useState('company')

  return (
    <Box style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Flex direction="column" gap="4">
        <Box>
          <Text size="8" weight="bold" style={{ display: 'block' }}>
            Админка
          </Text>
          <Text size="3" color="gray">
            Управление настройками компании и пользователями. Все поля по архитектуре.
          </Text>
        </Box>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="company">Настройки компании</Tabs.Trigger>
            <Tabs.Trigger value="users">Пользователи</Tabs.Trigger>
            <Tabs.Trigger value="fields">Справочник полей</Tabs.Trigger>
          </Tabs.List>

          <Box pt="4">
            <Tabs.Content value="company">
              <GeneralSettings />
            </Tabs.Content>

            <Tabs.Content value="users">
              <UsersSettings />
            </Tabs.Content>

            <Tabs.Content value="fields">
              <Card>
                <Text size="4" weight="bold" mb="4" style={{ display: 'block' }}>
                  Справочник полей (архитектура)
                </Text>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text size="3" weight="bold" mb="2">
                      Company
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
                        {[
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
                        ].map(([field, type, desc]) => (
                          <Table.Row key={field as string}>
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
                  <Box>
                    <Text size="3" weight="bold" mb="2">
                      User
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
                        {[
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
                          ['custom_attributes', 'JSON', 'Доп. поля'],
                        ].map(([field, type, desc]) => (
                          <Table.Row key={field as string}>
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
                </Flex>
              </Card>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Box>
  )
}
