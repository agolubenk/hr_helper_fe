/**
 * Типы для страницы ИИ чата (экспорт для компонентов aichat).
 * Полная страница будет подключена при добавлении роута /aichat.
 */

export interface Chat {
  id: string
  title: string
  createdAt: string
  lastMessage?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  files?: File[]
}
