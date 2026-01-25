/**
 * Error Boundary Components for Dashboard
 *
 * These components provide visual feedback when data loading fails,
 * improving error handling and user experience.
 */

import * as Lucide from 'lucide-react'

interface ErrorStateProps {
  title: string
  message: string
  onRetry?: () => void
  icon?: React.ComponentType<{ className?: string }>
}

export function ErrorState({
  title,
  message,
  onRetry,
  icon: Icon = Lucide.AlertCircle
}: ErrorStateProps) {
  return (
    <div className='flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center'>
      <div className='mb-4 rounded-full bg-red-100 p-4'>
        <Icon className='size-8 text-red-600' />
      </div>
      <h3 className='mb-2 text-lg font-semibold text-gray-900'>{title}</h3>
      <p className='mb-6 max-w-md text-sm text-gray-600'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md'
        >
          <Lucide.RefreshCw className='size-4' />
          Try Again
        </button>
      )}
    </div>
  )
}

export function DashboardError({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  return (
    <div className='space-y-6'>
      <ErrorState
        title='Failed to Load Dashboard'
        message={
          error.message ||
          'An unexpected error occurred while loading your dashboard data. Please try again.'
        }
        onRetry={onRetry}
        icon={Lucide.AlertTriangle}
      />
    </div>
  )
}

export function EmptyState({
  title,
  message,
  icon: Icon = Lucide.Inbox,
  action,
  actionLabel
}: {
  title: string
  message: string
  icon?: React.ComponentType<{ className?: string }>
  action?: () => void
  actionLabel?: string
}) {
  return (
    <div className='flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center'>
      <div className='mb-4 rounded-full bg-gray-100 p-4'>
        <Icon className='size-8 text-gray-400' />
      </div>
      <h3 className='mb-2 text-lg font-semibold text-gray-900'>{title}</h3>
      <p className='mb-6 max-w-md text-sm text-gray-600'>{message}</p>
      {action && actionLabel && (
        <button
          onClick={action}
          className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-md'
        >
          <Lucide.Plus className='size-4' />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title='Network Error'
      message='Unable to connect to the server. Please check your internet connection and try again.'
      onRetry={onRetry}
      icon={Lucide.WifiOff}
    />
  )
}

export function TimeoutError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title='Request Timeout'
      message='The request took too long to complete. Please try again.'
      onRetry={onRetry}
      icon={Lucide.Clock}
    />
  )
}

export function UnauthorizedError() {
  return (
    <ErrorState
      title='Session Expired'
      message='Your session has expired. Please sign in again to continue.'
      icon={Lucide.Lock}
    />
  )
}

export function NotFoundError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title='Not Found'
      message='The requested resource was not found. It may have been moved or deleted.'
      onRetry={onRetry}
      icon={Lucide.SearchX}
    />
  )
}
