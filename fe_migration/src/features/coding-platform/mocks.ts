import type { CodingLanguageEdge, CodingLanguageNode } from './types'

/** Полная карта стеков (фильтрация по подключённым — на странице «Языки и связи»). */
export const codingGraphNodes: CodingLanguageNode[] = [
  { id: 'html', label: 'HTML', subtitle: 'Разметка', x: 88, y: 300 },
  { id: 'css', label: 'CSS', subtitle: 'Стили', x: 88, y: 140 },
  { id: 'js', label: 'JavaScript', subtitle: 'Язык', x: 300, y: 220 },
  { id: 'ts', label: 'TypeScript', subtitle: 'Надмножество', x: 300, y: 72 },
  { id: 'react', label: 'React', subtitle: 'UI', x: 500, y: 140 },
  { id: 'node', label: 'Node.js', subtitle: 'Рантайм', x: 300, y: 360 },
  { id: 'python', label: 'Python', subtitle: 'Live coding', x: 520, y: 260 },
  { id: 'go', label: 'Go', subtitle: 'Systems', x: 520, y: 340 },
  { id: 'rust', label: 'Rust', subtitle: 'Systems', x: 520, y: 420 },
  { id: 'sql', label: 'SQL', subtitle: 'Данные', x: 120, y: 48 },
  { id: 'json', label: 'JSON', subtitle: 'Данные', x: 48, y: 200 },
]

export const codingGraphEdges: CodingLanguageEdge[] = [
  { id: 'e1', fromId: 'ts', toId: 'js', label: 'компиляция →' },
  { id: 'e2', fromId: 'html', toId: 'js', label: 'DOM + скрипты' },
  { id: 'e3', fromId: 'css', toId: 'html', label: 'оформление' },
  { id: 'e4', fromId: 'js', toId: 'react', label: 'основа' },
  { id: 'e5', fromId: 'js', toId: 'node', label: 'тот же язык' },
  { id: 'e6', fromId: 'node', toId: 'python', label: 'типичный бэкенд-пул' },
  { id: 'e7', fromId: 'node', toId: 'go', label: 'сервисы' },
  { id: 'e8', fromId: 'go', toId: 'rust', label: 'systems' },
  { id: 'e9', fromId: 'python', toId: 'sql', label: 'ORM / raw SQL' },
  { id: 'e10', fromId: 'js', toId: 'json', label: 'parse / API' },
  { id: 'e11', fromId: 'sql', toId: 'node', label: 'драйверы БД' },
]
