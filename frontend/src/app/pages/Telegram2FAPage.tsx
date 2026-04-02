/**
 * Telegram2FAPage — страница настройки Telegram 2FA (/telegram/2fa).
 *
 * Mock-реализация: ввод облачного пароля + кнопки подтверждения/отмены.
 */

import { Box, Button, Flex, Text, TextField } from '@radix-ui/themes'
import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Link } from '@/router-adapter'
import styles from './styles/Telegram.module.css'

export function Telegram2FAPage() {
  const [password, setPassword] = useState('')

  return (
    <AppLayout pageTitle="Telegram — 2FA">
      <Box className={styles.authContainer}>
        <Flex justify="center">
          <Box className={styles.card} style={{ maxWidth: 400 }}>
            <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
              Двухэтапная аутентификация
            </Text>

            <Text size="2" color="gray" style={{ marginBottom: 24, display: 'block' }}>
              Введите облачный пароль. Он нужен для входа в аккаунт на новых устройствах и отключения 2FA.
            </Text>

            <Box mb="4">
              <Text size="2" weight="medium" color="gray" as="label" style={{ display: 'block', marginBottom: 8 }}>
                Облачный пароль
              </Text>
              <TextField.Root
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && password.trim()) {
                    // TODO: реальная отправка на сервер через Telegram API
                    console.log('Telegram 2FA: подтверждение', password)
                  }
                }}
              />
            </Box>

            <Flex gap="3" wrap="wrap">
              <Button
                onClick={() => {
                  if (!password.trim()) return
                  // TODO: реальная отправка на сервер через Telegram API
                  console.log('Telegram 2FA: подтверждение', password)
                }}
                disabled={!password.trim()}
              >
                Подтвердить
              </Button>

              <Button asChild variant="soft">
                <Link href="/telegram">Отмена</Link>
              </Button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </AppLayout>
  )
}

