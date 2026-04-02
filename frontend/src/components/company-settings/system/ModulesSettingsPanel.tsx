import { Badge, Box, Button, Callout, Card, Flex, Switch, Text } from '@radix-ui/themes'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  collectLeavesUnderNode,
  getMenuModulesSections,
  MENU_MODULE_RELATED_WHEN_DISABLED,
  type MenuModuleNode,
} from '@/features/system-settings/menuModulesRegistry'
import {
  readModuleEnableMap,
  writeModuleEnableMap,
  COMPANY_MODULES_CHANGED_EVENT,
} from '@/features/system-settings/moduleSettingsStorage'
import type { ModuleEnableMap } from '@/features/system-settings/types'
import { useToast } from '@/components/Toast/ToastContext'
import styles from './ModulesSettingsPanel.module.css'

function countEnabledInLeaves(leafIds: string[], map: ModuleEnableMap): { on: number; total: number } {
  const total = leafIds.length
  const on = leafIds.filter((id) => map[id] !== false).length
  return { on, total }
}

function LockedBranch({ node, depth }: { node: MenuModuleNode; depth: number }) {
  return (
    <Box className={depth > 0 ? styles.nestedLeaves : undefined} pl={depth > 0 ? '3' : '0'}>
      <Text size={depth === 0 ? '2' : '1'} color="gray" weight={depth === 0 ? 'medium' : 'regular'} as="div">
        {node.label}
      </Text>
      {node.children?.map((ch) => (
        <LockedBranch key={ch.id} node={ch} depth={depth + 1} />
      ))}
    </Box>
  )
}

interface ModuleSubtreeEditorProps {
  node: MenuModuleNode
  topLevelId: string
  depth: number
  enabledMap: ModuleEnableMap
  patchMany: (ids: string[], value: boolean, toastContext: { topLevelId: string; turningOff: boolean }) => void
}

function ModuleSubtreeEditor({ node, topLevelId, depth, enabledMap, patchMany }: ModuleSubtreeEditorProps) {
  const leavesUnder = useMemo(() => collectLeavesUnderNode(node), [node])
  const isStructural = Boolean(node.children?.length)

  if (node.locked) {
    return null
  }

  if (!isStructural) {
    const on = enabledMap[node.id] !== false
    return (
      <div className={styles.leafRow} style={{ paddingLeft: `calc(var(--space-3) + ${depth} * var(--space-4))` }}>
        <div className={styles.leafMeta}>
          <Text size="2" className={styles.leafLabel} weight="medium">
            {node.label}
          </Text>
        </div>
        <Switch
          checked={on}
          onCheckedChange={(v) => {
            const next = Boolean(v)
            patchMany([node.id], next, { topLevelId, turningOff: !next })
          }}
          aria-label={node.label}
        />
      </div>
    )
  }

  const { on, total } = countEnabledInLeaves(leavesUnder, enabledMap)
  const relatedLines = MENU_MODULE_RELATED_WHEN_DISABLED[node.id]
  const showRelatedMuted = on < total && relatedLines

  return (
    <div className={styles.unlockedGroup}>
      <div className={styles.groupHeader}>
        <div className={styles.groupTitle}>
          <Text size="2" weight="bold" className={styles.groupTitleLabel}>
            {node.label}
          </Text>
          <Text as="p" size="1" color="gray" className={styles.groupCountLine}>
            Включено разделов: {on} из {total}
          </Text>
          {relatedLines && on === total ? (
            <Box className={styles.relatedInfoMuted} mt="2">
              <Text size="1" weight="medium">
                При отключении учтите
              </Text>
              <ul className={styles.relatedList}>
                {relatedLines.map((line) => (
                  <li key={line}>
                    <Text size="1">{line}</Text>
                  </li>
                ))}
              </ul>
            </Box>
          ) : null}
          {showRelatedMuted ? (
            <Box className={styles.relatedInfo} mt="2">
              <Text size="1" weight="medium">
                Часть функций скрыта — влияние на продукт
              </Text>
              <ul className={styles.relatedList}>
                {relatedLines!.map((line) => (
                  <li key={line}>
                    <Text size="1">{line}</Text>
                  </li>
                ))}
              </ul>
            </Box>
          ) : null}
        </div>
        <div className={styles.groupActions}>
          <Button size="1" variant="soft" onClick={() => patchMany(leavesUnder, false, { topLevelId, turningOff: true })}>
            Снять все
          </Button>
          <Button size="1" variant="soft" onClick={() => patchMany(leavesUnder, true, { topLevelId, turningOff: false })}>
            Включить все
          </Button>
        </div>
      </div>
      {node.children!.map((ch) => (
        <ModuleSubtreeEditor
          key={ch.id}
          node={ch}
          topLevelId={topLevelId}
          depth={depth + 1}
          enabledMap={enabledMap}
          patchMany={patchMany}
        />
      ))}
    </div>
  )
}

export function ModulesSettingsPanel() {
  const { showInfo } = useToast()
  const sections = useMemo(() => getMenuModulesSections(), [])
  const [enabledMap, setEnabledMap] = useState<ModuleEnableMap>(() => readModuleEnableMap())

  const syncFromStorage = useCallback(() => {
    setEnabledMap(readModuleEnableMap())
  }, [])

  useEffect(() => {
    syncFromStorage()
    window.addEventListener(COMPANY_MODULES_CHANGED_EVENT, syncFromStorage)
    return () => window.removeEventListener(COMPANY_MODULES_CHANGED_EVENT, syncFromStorage)
  }, [syncFromStorage])

  const patchMany = useCallback(
    (ids: string[], value: boolean, ctx: { topLevelId: string; turningOff: boolean }) => {
      if (!value && ctx.turningOff && MENU_MODULE_RELATED_WHEN_DISABLED[ctx.topLevelId]) {
        const lines = MENU_MODULE_RELATED_WHEN_DISABLED[ctx.topLevelId]
        showInfo('Связанные разделы', lines.join(' '))
      }
      setEnabledMap((prev) => {
        const next = { ...prev }
        for (const id of ids) next[id] = value
        writeModuleEnableMap(next)
        return next
      })
    },
    [showInfo]
  )

  return (
    <Flex direction="column" gap="4">
      <Callout.Root color="blue">
        <Callout.Text style={{ whiteSpace: 'normal' }}>
          Структура повторяет боковое меню (кроме пункта «Главная»). Отдельные подразделы можно включать и выключать
          независимо — удобно для поэтапного внедрения. Сохранение пока локальное; далее — синхронизация с API
          арендатора.
        </Callout.Text>
      </Callout.Root>

      <Callout.Root color="gray">
        <Callout.Text style={{ whiteSpace: 'normal' }}>
          <strong>Всегда доступны и не настраиваются на этой странице:</strong> задачи, отчёты и аналитика, интеграции
          и автоматизации, раздел настроек компании, профиль и администрирование — они остаются в меню независимо от
          переключателей ниже.
        </Callout.Text>
      </Callout.Root>

      {sections.map((sec) => (
        <Box key={sec.sectionLabel} className={styles.sectionBlock}>
          <Text as="p" size="5" weight="bold" className={styles.sectionTitle}>
            {sec.sectionLabel}
          </Text>
          <Text as="p" size="2" color="gray" className={styles.sectionIntro}>
            Те же группы, что и в сайдбаре после заголовка раздела. Текст переносится по строкам; подсказки о связях
            показаны для блоков, которые влияют на другие области продукта.
          </Text>
          <Card size="1" variant="surface">
            <div className={styles.cardInner}>
              {sec.roots.map((root) => {
                if (root.locked) {
                  return (
                    <div key={root.id} className={styles.lockedRow}>
                      <div className={styles.lockedHead}>
                        <div className={styles.lockedMeta}>
                          <Flex align="center" gap="2" wrap="wrap">
                            <Text as="span" size="2" weight="bold" className={styles.lockedTitle}>
                              {root.label}
                            </Text>
                            <Badge size="1" color="gray">
                              Обязательный модуль
                            </Badge>
                          </Flex>
                          <Text size="1" color="gray" className={styles.lockedNote}>
                            Пункт и все вложенные разделы меню всегда отображаются. Отключение недоступно по требованиям
                            к платформе.
                          </Text>
                          {root.children?.length ? (
                            <div className={styles.lockedTree}>
                              <LockedBranch node={root} depth={0} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                }
                return (
                  <ModuleSubtreeEditor
                    key={root.id}
                    node={root}
                    topLevelId={root.id}
                    depth={0}
                    enabledMap={enabledMap}
                    patchMany={patchMany}
                  />
                )
              })}
            </div>
          </Card>
        </Box>
      ))}

      <Text as="p" size="1" color="gray" className={styles.hint}>
        Ключ хранения: <code>hr-helper-menu-modules-v2</code>. При отключении подраздела проверьте виджеты на главной и
        ссылки из смежных блоков меню.
      </Text>
    </Flex>
  )
}
