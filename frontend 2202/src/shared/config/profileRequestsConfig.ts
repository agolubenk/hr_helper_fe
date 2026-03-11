/**
 * Конфигурация блоков «Мои заявки» и «Мои документы» для профиля и сайдбара.
 */
export const PROFILE_REQUESTS_BLOCKS: { blockLabel: string; items: { label: string; href: string }[] }[] = [
  {
    blockLabel: 'Мои заявки',
    items: [
      { label: 'Доступы', href: '/hr-services/access' },
      { label: 'Отпуска', href: '/hr-services/leave' },
      { label: 'Тикеты', href: '/hr-services/tickets' },
      { label: 'Запросы на обучение', href: '/learning/requests' },
      { label: 'Льготы', href: '/my-requests/benefits' },
      { label: 'Прочие', href: '/my-requests/other' },
    ],
  },
  {
    blockLabel: 'Мои документы',
    items: [
      { label: 'Договора', href: '/my-documents/contracts' },
      { label: 'Справки', href: '/my-documents/certificates' },
      { label: 'Политики', href: '/my-documents/policies' },
      { label: 'Акцепты', href: '/my-documents/acceptances' },
    ],
  },
]
