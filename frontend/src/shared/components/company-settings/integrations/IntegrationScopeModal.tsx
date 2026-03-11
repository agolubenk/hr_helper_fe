'use client'

import { Dialog, Flex, Text, Button } from '@radix-ui/themes'

interface IntegrationScopeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  integrationId: string
  integrationName: string
}

/**
 * Модальное окно выбора области применения интеграции.
 * Упрощённая версия — полная настройка в разработке.
 */
export default function IntegrationScopeModal({
  open,
  onOpenChange,
  integrationName,
}: IntegrationScopeModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={{ maxWidth: 400 }}>
        <Dialog.Title>Настройка {integrationName}</Dialog.Title>
        <Dialog.Description size="2" color="gray" mt="2" mb="4">
          Выбор режима учётных данных (общий / у каждого свой / оба) и настройка API-ключей.
        </Dialog.Description>
        <Text size="2" color="gray" mb="4" style={{ display: 'block' }}>
          Полная настройка интеграции в разработке. API-ключи можно настроить в профиле пользователя.
        </Text>
        <Flex gap="2" justify="end">
          <Dialog.Close>
            <Button variant="soft">Закрыть</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
