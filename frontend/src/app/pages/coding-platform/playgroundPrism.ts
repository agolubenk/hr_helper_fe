import Prism from 'prismjs'

/* clike обязателен до javascript, java, kotlin, csharp, c, dart и др. */
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-dart'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-markdown'

/** id вкладки песочницы → язык Prism.highlight (третий аргумент и ключ Prism.languages). */
const TAB_TO_PRISM: Record<string, string> = {
  html: 'markup',
  css: 'css',
  js: 'javascript',
  react: 'jsx',
  ts: 'typescript',
  node: 'javascript',
  python: 'python',
  go: 'go',
  rust: 'rust',
  sql: 'sql',
  json: 'json',
  vue: 'markup',
  svelte: 'markup',
  angular: 'typescript',
  java: 'java',
  kotlin: 'kotlin',
  csharp: 'csharp',
  php: 'php',
  ruby: 'ruby',
  bash: 'bash',
  cpp: 'cpp',
  c: 'c',
  swift: 'swift',
  dart: 'dart',
  docker: 'docker',
  markdown: 'markdown',
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function highlightPlaygroundCode(tabId: string, code: string): string {
  const alias = TAB_TO_PRISM[tabId]
  if (!alias) {
    return escapeHtml(code)
  }
  const grammar = Prism.languages[alias]
  if (!grammar) {
    return escapeHtml(code)
  }
  try {
    return Prism.highlight(code, grammar, alias)
  } catch {
    return escapeHtml(code)
  }
}
