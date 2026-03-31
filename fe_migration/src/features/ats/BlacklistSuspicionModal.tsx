import { Box, Button, Dialog, Flex, Text } from '@radix-ui/themes'
import type { BlacklistSuspicionMatch } from './mocks'
import styles from './BlacklistSuspicionModal.module.css'

export interface BlacklistSuspicionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateName: string
  matches: BlacklistSuspicionMatch[]
}

export function BlacklistSuspicionModal({
  open,
  onOpenChange,
  candidateName,
  matches,
}: BlacklistSuspicionModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className={styles.shell}>
        <Box className={styles.header}>
          <Dialog.Title className={styles.title}>Подозрение на чёрный список</Dialog.Title>
          <Dialog.Description className={styles.subtitle}>
            Сверка прошлых компаний из опыта (резюме и профили) с чёрным списком в настройках рекрутинга.
            Кандидат: {candidateName}.
          </Dialog.Description>
        </Box>

        <Box className={styles.body}>
          <Box className={styles.hint}>
            <span className={styles.hintIcon} aria-hidden>
              ⛔
            </span>
            <Text size="2" color="gray" style={{ lineHeight: 1.45 }}>
              Совпадения носят эвристический характер (название юрлица, бренд, алиас). Перед решением
              проверьте карточку в «Настройки компании → Рекрутинг → Чёрный список компаний».
            </Text>
          </Box>

          {matches.length === 0 ? (
            <Text size="2" color="gray">
              Совпадений с чёрным списком не найдено.
            </Text>
          ) : (
            <Box className={styles.matchList}>
              {matches.map((m, i) => (
                <Box key={`${m.companyName}-${i}`} className={styles.matchCard}>
                  <Text as="div" className={styles.matchCompany}>
                    {m.companyName}
                  </Text>
                  <Text as="div" className={styles.matchReason}>
                    {m.matchReason}
                  </Text>
                  {m.sourceLabel ? (
                    <Text as="div" className={styles.matchSource}>
                      Источник: {m.sourceLabel}
                    </Text>
                  ) : null}
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Flex className={styles.footer} justify="end" gap="3">
          <Dialog.Close>
            <Button variant="solid" highContrast style={{ minWidth: 120 }}>
              Закрыть
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}
