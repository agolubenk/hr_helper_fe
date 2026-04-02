'use client'

import { Flex, Box, Text, Button } from "@radix-ui/themes"
import { RocketIcon, PlusIcon } from "@radix-ui/react-icons"
import { useRouter } from "@/router-adapter"
import styles from './WikiHeader.module.css'

export default function WikiHeader() {
  const router = useRouter()

  return (
    <Flex align="center" justify="between" className={styles.header}>
      <Text size="7" weight="bold" className={styles.title}>
        Список страниц вики
      </Text>
      
      <Flex gap="2" align="center" className={styles.actions}>
        <Button
          size="3"
          aria-label="Быстрый старт"
          className={styles.quickStartButton}
          style={{
            backgroundColor: 'var(--accent-9)',
            color: '#ffffff',
          }}
        >
          <RocketIcon width={16} height={16} />
          <span className={styles.quickStartLabel}>Быстрый старт</span>
        </Button>
        
        <Button
          size="3"
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
          }}
          onClick={() => router.push('/wiki/new/edit')}
        >
          <PlusIcon width={16} height={16} />
          Создать страницу
        </Button>
      </Flex>
    </Flex>
  )
}
