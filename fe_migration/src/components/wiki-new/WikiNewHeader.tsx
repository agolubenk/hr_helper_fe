import { Flex, Text, Button } from '@radix-ui/themes'
import { PlusIcon } from '@radix-ui/react-icons'
import { useRouter } from '@/router-adapter'
import styles from './WikiNewHeader.module.css'

export function WikiNewHeader() {
  const router = useRouter()

  return (
    <Flex align="center" justify="between" className={styles.header}>
      <Text size="7" weight="bold" className={styles.title}>
        База знаний и документация
      </Text>
      <Button size="3" onClick={() => router.push('/wiki-new/new/edit')}>
        <PlusIcon width={16} height={16} />
        Создать страницу
      </Button>
    </Flex>
  )
}
