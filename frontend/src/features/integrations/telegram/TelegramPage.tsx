import { Box, Flex, Text, Button, TextField, Separator } from '@radix-ui/themes'
import { useState } from 'react'
import styles from './TelegramPage.module.css'

function getQrPattern(): boolean[][] {
  const n = 21
  const m: boolean[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(false))
  const corners: [number, number][] = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ]
  corners.forEach(([r, c]) => {
    for (let i = 0; i < 7; i++)
      for (let j = 0; j < 7; j++) {
        m[r + i][c + j] = true
      }
  })
  for (let i = 2; i < 5; i++)
    for (let j = 2; j < 5; j++) m[i][j] = false
  for (let k = 0; k < n; k++) {
    m[6][k] = k % 2 === 0
    m[k][6] = k % 2 === 0
  }
  for (let i = 8; i < n; i++)
    for (let j = 8; j < n; j++) {
      if (i !== 6 && j !== 6 && (i + j) % 3 === 0) m[i][j] = true
    }
  for (let i = 0; i < 6; i++)
    for (let j = 8; j < n; j++) {
      if (j !== 6 && (i * 2 + j) % 5 === 0) m[i][j] = true
    }
  for (let i = 8; i < n; i++)
    for (let j = 0; j < 6; j++) {
      if (i !== 6 && (i + j * 2) % 5 === 1) m[i][j] = true
    }
  return m
}

const QR_PATTERN = getQrPattern()

export function TelegramPage() {
  const [phoneNumber, setPhoneNumber] = useState('')

  const handlePhoneInput = (value: string) => {
    const filtered = value.replace(/[^0-9()+]/g, '')
    setPhoneNumber(filtered)
  }

  const handlePhoneLogin = () => {
    if (!phoneNumber.trim()) return
    // TODO: интеграция с Telegram API
  }

  return (
    <Box className={styles.container}>
      <Box className={styles.card}>
        <Text size="4" weight="bold" style={{ display: 'block', marginBottom: 8 }}>
          Вход в Telegram
        </Text>
        <Text size="2" color="gray" style={{ marginBottom: 16, display: 'block' }}>
          Откройте Telegram на телефоне, перейдите в «Устройства» → «Подключить устройство» и отсканируйте QR-код.
        </Text>

        <Flex justify="center">
          <Box className={styles.qrWrap}>
            <div className={styles.qrGrid}>
              {QR_PATTERN.flatMap((row, i) =>
                row.map((filled, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={filled ? styles.qrCell : styles.qrCellEmpty}
                  />
                )),
              )}
            </div>
          </Box>
        </Flex>

        <Text size="1" color="gray" style={{ textAlign: 'center', display: 'block', marginTop: 8 }}>
          QR-код обновляется каждые 60 секунд
        </Text>

        <Flex align="center" gap="3" my="4">
          <Separator style={{ flex: 1 }} />
          <Text size="2" color="gray">или</Text>
          <Separator style={{ flex: 1 }} />
        </Flex>

        <Flex direction="column" gap="3" className={styles.phoneLoginForm}>
          <Text size="3" weight="medium" style={{ textAlign: 'center' }}>
            Войти по номеру телефона
          </Text>
          <TextField.Root
            placeholder="+7 (999) 123-45-67"
            value={phoneNumber}
            onChange={(e) => handlePhoneInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePhoneLogin()
            }}
            style={{ width: '100%' }}
          />
          <Button onClick={handlePhoneLogin} disabled={!phoneNumber.trim()} style={{ width: '100%' }}>
            Войти
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}
