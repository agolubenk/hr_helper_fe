import { Box, Card, Flex, Section, Text } from '@radix-ui/themes'
import { Link } from '@/router-adapter'
import { ADMIN_MODULES } from '@/app/admin/config'
import styles from '@/app/admin/admin.module.css'

export function AdminPage() {
  return (
    <Section size="2">
      <Text as="p" size="6" weight="bold" mb="2">
        Admin
      </Text>
      <Text as="p" size="2" color="gray" mb="6" style={{ maxWidth: '560px' }}>
        Обзор по модулям приложения. Данные и переходы сгруппированы по разделам.
      </Text>

      {ADMIN_MODULES.map((module) => (
        <Box key={module.id} mb="6">
          <Text as="p" size="3" weight="bold" mb="1" style={{ color: 'var(--gray-12)' }}>
            {module.label}
          </Text>
          {module.description ? (
            <Text as="p" size="1" color="gray" mb="3">
              {module.description}
            </Text>
          ) : null}
          <Flex gap="3" wrap="wrap">
            {module.items.map((item) => (
              <Link key={item.href} href={item.href} className={styles.cardLink}>
                <Card size="2" className={styles.dashboardCard}>
                  <Text size="2" weight="medium">
                    {item.label}
                  </Text>
                </Card>
              </Link>
            ))}
          </Flex>
        </Box>
      ))}
    </Section>
  )
}
