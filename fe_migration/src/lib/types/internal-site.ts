export interface BlogPostAuthor {
  id: number
  first_name?: string
  last_name?: string
  email?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  author: BlogPostAuthor
  created_at: string
  updated_at: string
  is_published: boolean
  is_pinned?: boolean
}

export interface BlogPostComment {
  id: number
  post_id: number
  author: BlogPostAuthor
  content: string
  created_at: string
  updated_at?: string
}

export interface BlogPostFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  is_published: boolean
  is_pinned?: boolean
}

export type InternalSiteRole = 'user' | 'admin'

