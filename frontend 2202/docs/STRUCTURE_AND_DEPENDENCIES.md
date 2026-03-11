# Структура и зависимости

Связи между конфигурацией, компонентами и роутингом.

---

## Структура проекта

```
hr-platform/frontend/
├── src/
│   ├── app/
│   │   ├── router/           # TanStack Router
│   │   │   ├── index.tsx     # Маршруты
│   │   │   ├── layouts/      # MainLayout, AdminLayout
│   │   │   └── routes/       # Страницы
│   │   └── providers/
│   ├── shared/
│   │   ├── config/           # menuConfig, settingsMenuConfig, adminMenuConfig
│   │   └── components/
│   └── features/             # Модули (recruiting, employees, performance)
└── docs/
```

---

## Зависимости конфигурации → компоненты

```
menuConfig.tsx
├── MAIN_MENU_ITEMS
├── MENU_SECTIONS
├── HOME_PAGE_BLOCKS, MODULE_FILTER_OPTIONS
├── SETTINGS_MENU_ITEMS (импорт)
└── используется: Sidebar, home.tsx

settingsMenuConfig.tsx
├── SETTINGS_MENU_ITEMS
└── используется: menuConfig, Sidebar

adminMenuConfig.tsx
├── ADMIN_MENU_ITEMS
└── используется: AdminLayout
```

---

## Sidebar: объединение данных

- **menuItemsById** = MAIN_MENU_ITEMS + company-settings из SETTINGS_MENU_ITEMS
- **settingsItemsAfterSeparator** = SETTINGS_MENU_ITEMS без company-settings
- Рендер: MENU_SECTIONS → menuItemsById → Separator → settingsItemsAfterSeparator

---

## Роутер → Layouts

- **MainLayout:** большинство страниц (/, /workflow, /calendar, /company-settings/*, /settings/*, /wiki/*, /internal-site/* и т.д.)
- **AdminLayout:** /admin/* (вложен в MainLayout)
- **RootLayout:** обёртка, Outlet

---

## Ключевые зависимости (package.json)

- React 18, @tanstack/react-router, @tanstack/react-query
- @radix-ui/themes, @radix-ui/react-icons
- driver.js, zustand, @tiptap/*, @dnd-kit/*
