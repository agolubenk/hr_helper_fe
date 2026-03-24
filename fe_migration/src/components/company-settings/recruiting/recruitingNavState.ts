/** Путь хаба «Рекрутинг» в настройках компании. */
export const RECRUITING_HUB_PATH = '/company-settings/recruiting'

/** Состояние навигации для дочерних страниц рекрутинга (см. docs/RECRUITING_SETTINGS_UX_PLAN_2026-03-24.md). */
export interface RecruitingNavigationState {
  /** Явный возврат на эту страницу (обычно хаб), если пришли с карточки хаба. */
  recruitingFrom?: string
}
