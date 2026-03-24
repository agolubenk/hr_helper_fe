# Фаза 8 — настройки компании: инвентаризация и чеклист

**Источник:** `Детальный план остаточной миграции hr_helper_fe.md` — **фаза 8**.  
**Цель:** зафиксировать результат автоматической сверки с `frontend old` и дать команде чеклист ручного smoke до закрытия фазы.

**Связанные файлы:** `MIGRATION_CHECK_URLS.md` (URL), `MIGRATION_DIVERGENCES.md` (**§12** — структурные выводы).

---

## 1. Каталог `src/components/company-settings/`

Сравнение: `frontend old/components/company-settings` ↔ `fe_migration/src/components/company-settings` (`diff -rq`).

| Результат | Детали |
|-----------|--------|
| **Состав файлов** | Одинаковый: **26** файлов (`.tsx`, `.module.css`, `pre-specification.json`, `COMPONENTS_DOCUMENTATION.md`). |
| **Содержимое** | **Полное совпадение** для всех файлов, кроме **четырёх** `.tsx` (см. ниже). |

### 1.1 Четыре файла с ожидаемыми отличиями (миграция Next → Vite)

| Файл | Отличие fe_migration от `frontend old` |
|------|----------------------------------------|
| `EmployeeLifecycleSettings.tsx` | `import Link from "next/link"` → `import { Link } from "@/router-adapter"` |
| `RecruitingStagesSettings.tsx` | то же для `Link` |
| `SLASettings.tsx` | `useRouter` из `next/navigation` → из `@/router-adapter` |
| `RatingScalesSettings.tsx` | Вызовы тоста: во fe_migration передаётся заголовок и текст (`toast.showError('Ошибка', '…')`), в old — один аргумент |

Иных расхождений в этом каталоге **нет** (по `diff -rq` на дату фиксации документа).

---

## 2. Страницы маршрутов и интеграции

Подразделы **общие настройки, грейды, шкалы, жизненный цикл, поля кандидатов, scorecard, SLA, промпт, recruiting, finance** подключают те же компоненты из `components/company-settings/`, что и в Next (через `CompanySettingsPages.tsx` и аналоги).

### 2.1 `/company-settings/integrations` — осознанное отличие от Next

В **`frontend old`** страница интеграций использует отдельные модули рядом с `page.tsx`:

- `app/company-settings/integrations/IntegrationScopeModal.tsx`
- `app/company-settings/integrations/GoogleServicesModal.tsx`

В **`fe_migration`** экран **`CompanySettingsIntegrationsPage`** собран в **`src/app/pages/CompanySettingsPages.tsx`**: упрощённые карточки интеграций и **встроенные Radix `Dialog`** (область действия / Google), без побайтового переноса модалок из Next.

**Вывод:** функциональный и визуальный паритет с **3001** для этого URL **не заявлен**; доработка под полный паритет — отдельная задача. Зафиксировано в **`MIGRATION_DIVERGENCES.md` §12.2**.

---

## 3. Ручной smoke (закрытие фазы 8)

После прохода отметить в **`MIGRATION_CHECK_URLS.md`** или трекере команды.

1. Пройти блок **«Настройки компании»** в `MIGRATION_CHECK_URLS.md` (все URL).
2. **Приоритет:** `/company-settings/integrations`, `/company-settings/finance`, затем recruiting и остальное.
3. Любое новое отличие от 3001 / ожиданий продукта — строка в **`MIGRATION_DIVERGENCES.md` §9** (журнал приёмки).
4. Регресс по бенчмаркам: `/company-settings/finance/benchmarks` согласован с **`/finance/benchmarks`** (см. детальный план **§6.2**).

---

*Зафиксировано: март 2026 — автоматическая сверка каталога компонентов + описание экрана интеграций.*
