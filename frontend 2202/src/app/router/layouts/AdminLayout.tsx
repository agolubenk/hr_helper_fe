/**
 * AdminLayout — layout админки с левым меню моделей и субменю
 * Левое меню: все представления/модели
 * Субменю: подэлементы выбранной модели (под основным меню)
 */
import { Box, Flex, Text } from '@radix-ui/themes'
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { ADMIN_MENU_ITEMS, type AdminMenuItem } from '@/shared/config/adminMenuConfig'
import styles from './AdminLayout.module.css'

function isItemOrChildrenActive(item: AdminMenuItem, pathname: string | null | undefined): boolean {
  if (!pathname) return false
  // /admin (index) — считаем активной Компанию
  if (pathname === '/admin' && item.id === 'company') return true
  if (item.href && (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)))) return true
  if (item.children?.length) return item.children.some((c) => isItemOrChildrenActive(c, pathname))
  return false
}

function AdminSidebarItem({
  item,
  isActive,
  onClick,
}: {
  item: AdminMenuItem
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Flex
      align="center"
      gap="2"
      px="3"
      py="2"
      className={`${styles.adminMenuItem} ${isActive ? styles.adminMenuItemActive : ''}`}
      onClick={onClick}
    >
      {item.icon && <Box style={{ minWidth: 20, display: 'flex', alignItems: 'center' }}>{item.icon}</Box>}
      <Text size="2" style={{ flex: 1 }}>
        {item.label}
      </Text>
    </Flex>
  )
}

function AdminSubmenuItem({
  item,
  isActive,
  onClick,
}: {
  item: AdminMenuItem
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Flex
      align="center"
      gap="2"
      px="3"
      py="2"
      className={`${styles.adminSubmenuItem} ${isActive ? styles.adminSubmenuItemActive : ''}`}
      onClick={onClick}
    >
      <Text size="2">{item.label}</Text>
    </Flex>
  )
}

export function AdminLayout() {
  const navigate = useNavigate()
  const pathname = useRouterState().location.pathname

  const activeMainItem = ADMIN_MENU_ITEMS.find((item) => isItemOrChildrenActive(item, pathname))
  const submenuItems = activeMainItem?.children ?? []

  return (
    <Flex gap="0" style={{ width: '100%', flex: 1, minHeight: 0, alignSelf: 'stretch', overflow: 'hidden' }}>
      {/* Левое меню — основные модели */}
      <Box
        className={styles.adminSidebar}
        style={{
          width: 220,
          minWidth: 220,
          minHeight: 0,
          alignSelf: 'stretch',
          borderRight: '1px solid var(--gray-a6)',
          backgroundColor: 'var(--gray-2)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Box px="2" pt="0" pb="2" style={{ flexShrink: 0 }}>
          <Text size="1" weight="bold" color="gray" mb="2" style={{ display: 'block', paddingLeft: 12 }}>
            Модели и представления
          </Text>
          <Flex direction="column" gap="1">
            {ADMIN_MENU_ITEMS.map((item) => (
              <AdminSidebarItem
                key={item.id}
                item={item}
                isActive={isItemOrChildrenActive(item, pathname)}
                onClick={() => item.href && navigate({ to: item.href })}
              />
            ))}
          </Flex>
        </Box>

        {/* Субменю — подэлементы выбранной модели */}
        {submenuItems.length > 0 && (
          <Box
            pt="2"
            style={{ borderTop: '1px solid var(--gray-a6)', flexShrink: 0 }}
          >
            <Text size="1" weight="bold" color="gray" mb="2" style={{ display: 'block', paddingLeft: 12 }}>
              {activeMainItem?.label}
            </Text>
            <Flex direction="column" gap="1">
              {submenuItems.map((item) => {
                const isActive =
                  (pathname === '/admin' && item.id === 'company-general') ||
                  (item.href ? pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) : false)
                return (
                  <AdminSubmenuItem
                    key={item.id}
                    item={item}
                    isActive={isActive}
                    onClick={() => item.href && navigate({ to: item.href })}
                  />
                )
              })}
            </Flex>
          </Box>
        )}
      </Box>

      {/* Контент */}
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          padding: 24,
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Flex>
  )
}
