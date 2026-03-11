# Миграция настроек компании из fullstack в hr-platform

План постепенной миграции страниц и логики.

---

## Источник и целевая платформа

| | fullstack | hr-platform |
|---|-----------|-------------|
| Фреймворк | Next.js App Router | Vite + TanStack Router |
| Роутинг | app/company-settings/... | src/app/router/routes/... |
| Layout | AppLayout | MainLayout |
| Навигация | router.push() | navigate({ to: '...' }) |
| Ссылки | Link href= | Link to= |

---

## Порядок миграции (рекомендуемый)

### Фаза 1: База ✅
1. Общие настройки (/company-settings) — GeneralSettings
2. Роуты и меню — все пути в router

### Фаза 2: Справочники и структура ✅
3. Оргструктура
4. Грейды
5. Шкалы оценок

### Фаза 3: HR-процессы ✅
6. Жизненный цикл
7. Финансы

### Фаза 4: Интеграции и пользователи ✅
8. Интеграции
9. Группы пользователей
10. Пользователи

### Фаза 5: Настройки рекрутинга ✅ (частично)
11. Правила привлечения — ⚠️ PlaceholderPage
12. Этапы найма — ✅
13. Команды workflow — ✅
14. Шаблон оффера — ⚠️ PlaceholderPage
15. Поля кандидатов — ✅
16. Scorecard — ✅
17. SLA — ✅
18. Промпт вакансий — ✅

---

## Структура путей

```
/company-settings/                    # Общие настройки
├── org-structure
├── grades
├── rating-scales
├── employee-lifecycle
├── finance
├── integrations
├── meeting-settings
├── user-groups
├── users
├── recruiting/
│   ├── rules
│   ├── stages
│   ├── commands
│   └── offer-template
├── candidate-fields
├── scorecard
├── sla
└── vacancy-prompt
```

---

## Компоненты для переноса (оставшиеся)

| Компонент | fullstack | Статус |
|-----------|-----------|--------|
| AttractionRulesPage | components/company-settings/ | ⚠️ Placeholder |
| OfferTemplatePage | app/company-settings/recruiting/ | ⚠️ Placeholder (mammoth, JSZip) |
