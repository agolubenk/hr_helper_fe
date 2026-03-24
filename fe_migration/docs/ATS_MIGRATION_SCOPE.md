# ATS — объём и расположение кода

## Где лежит реализация

- **Модуль:** `src/features/ats/` — перенос UI из эталонного пакета `frontend/src/features/ai/ats/` (Vite-целевой стек), с адаптацией импортов под `fe_migration` (`@/router-adapter`, `@/components/workflow/*`, `@/lib/socialPlatforms`, `@/components/Toast/ToastContext`).
- **Моки и типы:** `src/features/ats/mocks.ts` (кандидаты, рейтинги, вакансии, `getVacancyIdByTitle`, и т.д.).
- **Настройки вакансии (вкладка в ATS):** `VacancySettingsForms.tsx`.
- **Стили:** `AtsPage.module.css`.
- **Маршруты:** `src/app/App.tsx` — импорты из `@/features/ats`.

Страницы **оценок** (`/assessment/new`, `/assessment/:id`, `/edit`) — те же **заглушки**, что и в `frontend`: навигация и каркас, формы после API.

## Дальше (интеграция)

- Подключить реальные API вместо моков и локального state.
- Расширить страницы assessment при появлении контракта.

## Недавние итерации UI (март 2026, моки)

- Карточка кандидата → «Опыт»: единая хронология версий (`AtsCandidate` + `experienceVersionHistory`), подвкладки резюме/профиля без дублирования истории при наличии глобального таймлайна.
- Версии: отображение от новых к старым; иконки источника снимка; модалка расхождений — только соседние версии.
- Стили переключателя Candidates / кнопка «+» / бейдж — см. `AtsPage.module.css` и журнал в `docs/DETAILED_PLAN_STATUS.md`.

*Историческое решение «не гнаться за пиксельным паритетом с `frontend old`» сохраняется — эталоном UI служит `frontend`, а не Next-ветка без `app/ats`.*
