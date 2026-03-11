/**
 * Toast — единый переиспользуемый компонент уведомлений
 *
 * Используется во всех приложениях платформы (hr-platform, fullstack и др.)
 *
 * Экспорты:
 * - ToastProvider — обёртка провайдера (подключать в корень приложения)
 * - useToast — хук для показа уведомлений
 * - Toast, ToastType, ToastAction, ToastData — типы и компонент
 */
export { ToastProvider, useToast } from './ToastContext'
export type { ToastAction, ToastData } from './ToastContext'
export { default as Toast } from './Toast'
export type { ToastType, ToastProps } from './Toast'
