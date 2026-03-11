/**
 * Страница списка статей вики.
 * Wikipedia-стиль: категории, теги, поиск, группировка по категориям.
 */
import { useState, useEffect } from 'react'
import { Flex, Text, TextField, Select, Badge, Box, Card, Spinner } from '@radix-ui/themes'
import { Link, useRouterState } from '@tanstack/react-router'
import { MagnifyingGlassIcon, PlusIcon, FileTextIcon, CubeIcon } from '@radix-ui/react-icons'
import { fetchWikiPages, fetchWikiTags } from '@/shared/api/wiki'
import type { WikiPage, WikiTag } from '@/shared/types/wiki'
import { WIKI_CATEGORIES, RELATED_APP_CHOICES } from '@/shared/types/wiki'
import styles from './WikiListPage.module.css'

function getSearchParams(): { category?: string; tag?: string; app?: string; q?: string } {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  return {
    category: params.get('category') || undefined,
    tag: params.get('tag') || undefined,
    app: params.get('app') || undefined,
    q: params.get('q') || undefined,
  }
}

export function WikiListPage() {
  const routerState = useRouterState()
  const initialSearch = getSearchParams()
  const [pages, setPages] = useState<WikiPage[]>([])
  const [tags, setTags] = useState<WikiTag[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(initialSearch.category ?? '')
  const [tag, setTag] = useState(initialSearch.tag ?? '')
  const [app, setApp] = useState(initialSearch.app ?? '')
  const [search, setSearch] = useState(initialSearch.q ?? '')

  useEffect(() => {
    const p = getSearchParams()
    setCategory(p.category ?? '')
    setTag(p.tag ?? '')
    setApp(p.app ?? '')
    setSearch(p.q ?? '')
  }, [routerState.location.search])

  const apiCategory = category === 'Без категории' ? '' : category || undefined

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchWikiPages({ category: apiCategory, tag: tag || undefined, app: app || undefined, q: search || undefined }),
      fetchWikiTags(),
    ])
      .then(([p, t]) => {
        setPages(p)
        setTags(t)
      })
      .finally(() => setLoading(false))
  }, [apiCategory, tag, app, search])

  const pagesByCategory = pages.reduce<Record<string, WikiPage[]>>((acc, p) => {
    const cat = p.category || 'Без категории'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  type TreeNode = { page: WikiPage; children: TreeNode[] }
  function buildTree(catPages: WikiPage[]): TreeNode[] {
    const byId = new Map<number, TreeNode>()
    for (const p of catPages) {
      byId.set(p.id, { page: p, children: [] })
    }
    const roots: TreeNode[] = []
    for (const p of catPages) {
      const node = byId.get(p.id)!
      if (p.parent_id == null) {
        roots.push(node)
      } else {
        const parent = byId.get(p.parent_id)
        if (parent) parent.children.push(node)
        else roots.push(node)
      }
    }
    const sortNode = (a: TreeNode, b: TreeNode) =>
      a.page.order - b.page.order || a.page.title.localeCompare(b.page.title)
    function sortTree(nodes: TreeNode[]) {
      nodes.sort(sortNode)
      nodes.forEach((n) => sortTree(n.children))
    }
    sortTree(roots)
    return roots
  }

  function TocNode({ node, level }: { node: TreeNode; level: number }) {
    const levelClass = styles[`tocLevel${level + 2}` as keyof typeof styles]
    const itemClass = styles[`tocItemLevel${level + 2}` as keyof typeof styles]
    const linkClass = styles[`tocLinkLevel${level + 2}` as keyof typeof styles]
    return (
      <li className={itemClass}>
        <Link to="/wiki/page/$slug" params={{ slug: node.page.slug }} className={linkClass}>
          <Text size="1" color="gray">{node.page.title}</Text>
        </Link>
        {node.children.length > 0 && (
          <ul className={levelClass}>
            {node.children.map((child) => (
              <TocNode key={child.page.id} node={child} level={level + 1} />
            ))}
          </ul>
        )}
      </li>
    )
  }

  const categoryOrder = ['Введение', 'Архитектура', 'Настройка', 'Использование', 'Интеграции', 'Без категории']
  const sortedCategories = Object.keys(pagesByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b) || a.localeCompare(b)
  )

  return (
    <Flex direction="column" gap="4" className={styles.container}>
      <Flex justify="end" align="center" wrap="wrap" gap="3" className={styles.headerRow}>
        <Flex gap="3" wrap="wrap" align="center" className={styles.filters}>
          <TextField.Root
            size="1"
            placeholder="Поиск по названию и содержанию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>
          <Select.Root value={category || '_'} onValueChange={(v) => setCategory(v === '_' ? '' : v)}>
            <Select.Trigger size="1" placeholder="Категория" className={styles.select} />
            <Select.Content>
              {WIKI_CATEGORIES.map((c) => (
                <Select.Item key={c.value || '_'} value={c.value || '_'}>
                  {c.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root value={tag || '_'} onValueChange={(v) => setTag(v === '_' ? '' : v)}>
            <Select.Trigger size="1" placeholder="Тег" className={styles.select} />
            <Select.Content>
              <Select.Item value="_">Все теги</Select.Item>
              {tags.map((t) => (
                <Select.Item key={t.id} value={t.name}>
                  {t.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Select.Root value={app || '_'} onValueChange={(v) => setApp(v === '_' ? '' : v)}>
            <Select.Trigger size="1" placeholder="Приложение" className={styles.select} />
            <Select.Content>
              {RELATED_APP_CHOICES.map((a) => (
                <Select.Item key={a.value || '_'} value={a.value || '_'}>
                  {a.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Link to="/wiki/create" className={styles.createBtnLink}>
            <Flex align="center" justify="center" gap="2" className={styles.createBtn}>
              <PlusIcon />
              <Text>Создать статью</Text>
            </Flex>
          </Link>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" py="8">
          <Spinner size="3" />
        </Flex>
      ) : pages.length === 0 ? (
        <Card className={styles.empty}>
          <Flex direction="column" align="center" gap="3" py="6">
            <FileTextIcon width={48} height={48} color="var(--gray-8)" />
            <Text size="3" color="gray">Статей пока нет</Text>
            <Link to="/wiki/create">
              <Text size="2" color="blue" style={{ textDecoration: 'underline' }}>
                Создать первую статью
              </Text>
            </Link>
          </Flex>
        </Card>
      ) : (
        <div className={styles.contentLayout}>
          <Flex direction="column" gap="5" className={styles.mainContent}>
            {sortedCategories.map((cat) => (
              <Box key={cat} id={`category-${cat.replace(/\s+/g, '-').toLowerCase()}`}>
                <Text size="2" weight="bold" color="gray" mb="2" style={{ display: 'block' }}>
                  {cat}
                </Text>
                <Flex direction="column" gap="2">
                  {pagesByCategory[cat].map((page) => {
                  const appLabel = page.related_app
                    ? RELATED_APP_CHOICES.find((a) => a.value === page.related_app)?.label
                    : null
                  return (
                    <Link key={page.id} to="/wiki/page/$slug" params={{ slug: page.slug }} className={styles.pageLink}>
                      <Card className={styles.pageCard}>
                        <Flex direction="column" gap="2">
                          <Flex align="center" gap="2" style={{ minWidth: 0 }}>
                            <FileTextIcon width={18} height={18} color="var(--gray-9)" />
                            <Text size="2" weight="medium" truncate>
                              {page.title}
                            </Text>
                            {page.description && (
                              <Text size="1" color="gray" truncate style={{ maxWidth: 200 }}>
                                — {page.description}
                              </Text>
                            )}
                          </Flex>
                          <Flex gap="2" wrap="wrap" align="center" className={styles.metaRow}>
                            {page.tags.map((t) => (
                              <Badge key={t.id} size="1" className={styles.tagBadge} style={{ backgroundColor: t.color, color: 'white' }}>
                                #{t.name}
                              </Badge>
                            ))}
                            {appLabel && (
                              <Flex align="center" gap="1" className={styles.appLabel}>
                                <CubeIcon width={12} height={12} />
                                <Text size="1" color="gray">{appLabel}</Text>
                              </Flex>
                            )}
                          </Flex>
                        </Flex>
                      </Card>
                    </Link>
                  )
                })}
              </Flex>
            </Box>
          ))}
          </Flex>
          <nav className={styles.tocSidebar} aria-label="Содержание">
            <ul className={styles.tocLevel1}>
              {sortedCategories.map((cat) => (
                <li key={cat} className={styles.tocItemLevel1}>
                  <a href={`#category-${cat.replace(/\s+/g, '-').toLowerCase()}`} className={styles.tocLinkLevel1}>
                    <Text size="2" weight="medium">{cat}</Text>
                  </a>
                  <ul className={styles.tocLevel2}>
                    {buildTree(pagesByCategory[cat]).map((node) => (
                      <TocNode key={node.page.id} node={node} level={0} />
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </Flex>
  )
}
