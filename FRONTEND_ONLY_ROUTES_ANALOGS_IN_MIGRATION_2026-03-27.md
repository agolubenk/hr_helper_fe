# Аналоги `frontend-only` маршрутов в `fe_migration` (2026-03-27)

Источник списка `frontend-only`: `FRONTEND_VS_MIGRATION_PAGES_DIFF_2026-03-27.md` (секция 3, строки 117-147).

## 1) Таблица соответствий: `frontend` -> `fe_migration`

Обозначения:

- `Точное` — маршрут есть 1:1
- `Частичное` — есть близкий по смыслу маршрут, но не 1:1
- `Заглушка` — попадает в wildcard-заглушку (`ModulePlaceholderPage`)
- `Нет` — прямого или очевидного аналога нет


| Маршрут в `frontend`                 | Аналог в `fe_migration` | Тип       | Комментарий                                                         |
| ------------------------------------ | ----------------------- | --------- | ------------------------------------------------------------------- |
| `/ai/recruiter-chat`                 | `/aichat`               | Частичное | AI-раздел присутствует, но отдельного recruiter-chat маршрута нет   |
| `/calendar/settings`                 | `/calendar`             | Частичное | Есть календарь, отдельной страницы настроек нет                     |
| `/company-settings/calendar`         | `/company-settings/*`   | Заглушка  | Точный route отсутствует, ловится wildcard в настройках компании    |
| `/company-settings/meeting-settings` | `/company-settings/*`   | Заглушка  | Точный route отсутствует, ловится wildcard в настройках компании    |
| `/errors/404`                        | `*` (Error404Page)      | Частичное | Отдельного `/errors/404` нет, но 404 отдается wildcard-роутом       |
| `/integrations/telegram`             | `/telegram`             | Частичное | В миграции Telegram вынесен в отдельную ветку                       |
| `/internal-site/post/:slug`          | `/internal-site/*`      | Заглушка  | Ветка `internal-site` есть, посты не выделены в отдельные страницы  |
| `/internal-site/post/:slug/edit`     | `/internal-site/*`      | Заглушка  | Аналогично: нет отдельного edit-route поста                         |
| `/internal-site/post/create`         | `/internal-site/*`      | Заглушка  | Аналогично: нет отдельного create-route поста                       |
| `/recruiting/huntflow`               | `/huntflow`             | Частичное | Есть Huntflow, но без префикса `/recruiting`                        |
| `/settings/custom-fields`            | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules`                  | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules/employees`        | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules/finance`          | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules/hr-services`      | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules/learning`         | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules/onboarding`       | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/modules/performance`      | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/permissions`              | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/roles`                    | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/user-groups`              | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/users`                    | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/settings/workflows`                | `/settings/*`           | Заглушка  | Попадает в общий placeholder ветки `/settings`                      |
| `/wiki/create`                       | `/wiki-new`             | Частичное | Отдельного create route в `wiki` нет; близкий сценарий в `wiki-new` |
| `/wiki/page/:slug`                   | `/wiki/:id`             | Частичное | Есть детальная страница wiki, но другая схема идентификатора        |
| `/wiki/page/:slug/edit`              | `/wiki/:id/edit`        | Частичное | Есть edit-route wiki, но другая схема идентификатора                |


## 2) Зафиксированные различия по общим страницам

(вынесено из `FRONTEND_VS_MIGRATION_PAGES_DIFF_2026-03-27.md`, секция 1.1, строки 13-20)


| Маршрут                          | Статус различий                                                              | Источник                           |
| -------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| `/workflow`                      | Есть зафиксированные UI/UX-отличия (сайдбар, кнопки отказа, поведение шапки) | `MIGRATION_DIVERGENCES.md` §3      |
| `/wiki`                          | Отличия зафиксированы; полная сверка отложена отдельной задачей              | `MIGRATION_DIVERGENCES.md` §5, §11 |
| `/account/profile`               | Есть зафиксированные отличия профиля/расписания/UI                           | `MIGRATION_DIVERGENCES.md` §7      |
| `/company-settings/integrations` | Отличия и follow-up по API/UX зафиксированы                                  | `MIGRATION_DIVERGENCES.md` §12.2   |


