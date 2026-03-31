/** Стартовые сниппеты для моноредакторов (мок), по id языка каталога. */
export const PLAYGROUND_MONO_DEFAULTS: Record<string, string> = {
  node: `// Node.js (мок — исполнение на сервере)\nconsole.log('npm run dev');`,
  python: `def greet(name: str) -> str:\n    return f"Hello, {name}!"\n\nprint(greet("Meet2Code"))`,
  go: `package main\nimport "fmt"\nfunc main() {\n  fmt.Println("Hello, Go")\n}`,
  rust: `fn main() {\n    println!("Hello, Rust");\n}`,
  sql: `SELECT id, title\nFROM tasks\nWHERE status = 'open'\nLIMIT 5;`,
  json: `{\n  "task": "frontend-interview",\n  "languages": ["ts", "react"],\n  "sandbox": true\n}`,
  ts: `type User = { id: string; name: string };\nconst u: User = { id: '1', name: 'Анна' };\nconsole.log(u.name);`,
  react: `// Слот React: в моке код склеивается с JS и выполняется в iframe (без CDN React)\nconsole.log('[React] подключите react+react-dom для JSX');`,
}
