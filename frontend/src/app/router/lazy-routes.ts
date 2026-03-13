import { lazyLoadNamed } from '@/shared/lib/lazy'

export const LazyBenchmarksPage = lazyLoadNamed(
  () => import('@/features/finance/benchmarks/BenchmarksPage'),
  'BenchmarksPage'
)

export const LazyReportingDashboardPage = lazyLoadNamed(
  () => import('@/features/reporting/ReportingDashboardPage'),
  'ReportingDashboardPage'
)

export const LazyCompanyReportPage = lazyLoadNamed(
  () => import('@/features/reporting/CompanyReportPage'),
  'CompanyReportPage'
)

export const LazyHiringPlanPage = lazyLoadNamed(
  () => import('@/features/reporting/HiringPlanPage'),
  'HiringPlanPage'
)

export const LazyHiringPlanYearlyPage = lazyLoadNamed(
  () => import('@/features/reporting/HiringPlanYearlyPage'),
  'HiringPlanYearlyPage'
)

export const LazyWorkflowPage = lazyLoadNamed(
  () => import('@/features/workflow/WorkflowPage'),
  'WorkflowPage'
)

export const LazyAIChatPage = lazyLoadNamed(
  () => import('@/features/ai/chat/AIChatPage'),
  'AIChatPage'
)

export const LazyWikiListPage = lazyLoadNamed(
  () => import('./routes/wiki/WikiListPage'),
  'WikiListPage'
)

export const LazyWikiDetailPage = lazyLoadNamed(
  () => import('./routes/wiki/WikiDetailPage'),
  'WikiDetailPage'
)

export const LazyWikiEditPage = lazyLoadNamed(
  () => import('./routes/wiki/WikiEditPage'),
  'WikiEditPage'
)

export const LazyWikiCreatePage = lazyLoadNamed(
  () => import('./routes/wiki/WikiCreatePage'),
  'WikiCreatePage'
)

export const LazyInternalSitePage = lazyLoadNamed(
  () => import('./routes/internal-site/InternalSitePage'),
  'InternalSitePage'
)
