import type { BlogPost, BlogPostComment, BlogPostFormData } from '@/lib/types/internal-site'

const author = (id: number, name: string) => ({
  id,
  first_name: name.split(' ')[0],
  last_name: name.split(' ')[1],
  email: `user${id}@example.com`,
})

let mockPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Добро пожаловать во внутренний портал',
    slug: 'welcome',
    excerpt: 'Краткое описание возможностей внутреннего сайта для сотрудников.',
    content:
      '<p>Внутренний сайт — это единая точка входа для всех сотрудников. Здесь вы найдёте новости, объявления и быстрый доступ к разделам системы.</p>',
    author: author(1, 'Голубенко Андрей'),
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    is_published: true,
    is_pinned: true,
  },
  {
    id: 2,
    title: 'Обновление: новый раздел Вики',
    slug: 'wiki-update',
    excerpt: 'Добавлена база знаний с категориями и тегами.',
    content:
      '<p>Раздел Вики теперь доступен всем сотрудникам. Вы можете искать статьи по категориям, тегам и приложениям.</p>',
    author: author(1, 'Голубенко Андрей'),
    created_at: '2024-02-05T14:00:00Z',
    updated_at: '2024-02-05T14:00:00Z',
    is_published: true,
    is_pinned: false,
  },
  {
    id: 3,
    title: 'Календарь интервью: синхронизация с Google',
    slug: 'calendar-sync',
    excerpt: 'Подключите Google Calendar для автоматического создания слотов.',
    content:
      '<p>В настройках календаря можно подключить Google Calendar. Слоты будут создаваться автоматически на основе рабочего времени.</p>',
    author: author(2, 'Иванов Иван'),
    created_at: '2024-02-10T09:00:00Z',
    updated_at: '2024-02-10T09:00:00Z',
    is_published: true,
    is_pinned: false,
  },
]

let mockComments: BlogPostComment[] = [
  {
    id: 1,
    post_id: 1,
    author: author(2, 'Иванов Иван'),
    content: 'Отличная новость! Жду обновлений.',
    created_at: '2024-02-01T11:30:00Z',
  },
  {
    id: 2,
    post_id: 1,
    author: author(3, 'Петрова Мария'),
    content: 'Спасибо за информацию.',
    created_at: '2024-02-01T12:00:00Z',
  },
]

let nextPostId = 4
let nextCommentId = 3

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function fetchBlogPosts(params?: { pinned?: boolean }): Promise<BlogPost[]> {
  await delay(200)
  let result = mockPosts.filter((post) => post.is_published)
  if (params?.pinned) result = result.filter((post) => post.is_pinned)
  return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  await delay(150)
  return mockPosts.find((post) => post.slug === slug && post.is_published) ?? null
}

export async function fetchBlogPostForEdit(slug: string): Promise<BlogPost | null> {
  await delay(150)
  return mockPosts.find((post) => post.slug === slug) ?? null
}

export async function fetchBlogPostComments(postId: number): Promise<BlogPostComment[]> {
  await delay(100)
  return mockComments
    .filter((comment) => comment.post_id === postId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
}

export async function createBlogPost(data: BlogPostFormData): Promise<BlogPost> {
  await delay(300)
  const post: BlogPost = {
    id: nextPostId++,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    author: author(1, 'Голубенко Андрей'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_published: data.is_published,
    is_pinned: data.is_pinned ?? false,
  }
  mockPosts.push(post)
  return post
}

export async function updateBlogPost(slug: string, data: BlogPostFormData): Promise<BlogPost> {
  await delay(300)
  const idx = mockPosts.findIndex((post) => post.slug === slug)
  if (idx < 0) throw new Error('Пост не найден')
  mockPosts[idx] = {
    ...mockPosts[idx],
    ...data,
    updated_at: new Date().toISOString(),
  }
  return mockPosts[idx]
}

export async function createComment(postId: number, content: string): Promise<BlogPostComment> {
  await delay(200)
  const comment: BlogPostComment = {
    id: nextCommentId++,
    post_id: postId,
    author: author(1, 'Голубенко Андрей'),
    content,
    created_at: new Date().toISOString(),
  }
  mockComments.push(comment)
  return comment
}

