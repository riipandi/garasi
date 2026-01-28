import * as Lucide from 'lucide-react'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Text, Strong } from '~/app/components/text'

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
    <Alert variant='danger' className='min-h-100'>
      <IconBox variant='danger-subtle' size='lg' circle className='mb-4'>
        <Icon className='size-8' />
      </IconBox>
      <Text>
        <Strong className='mb-2 text-lg'>{title}</Strong>
      </Text>
      <Text className='text-dimmed mb-6 max-w-md text-sm'>{message}</Text>
      {onRetry && (
        <Button variant='danger' onClick={onRetry}>
          <Lucide.RefreshCw className='size-4' />
          Try Again
        </Button>
      )}
    </Alert>
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
    <div className='border-border bg-accent flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
      <IconBox variant='secondary-subtle' size='lg' circle className='mb-4'>
        <Icon className='text-dimmed size-8' />
      </IconBox>
      <Text>
        <Strong className='mb-2 text-lg'>{title}</Strong>
      </Text>
      <Text className='text-dimmed mb-6 max-w-md text-sm'>{message}</Text>
      {action && actionLabel && (
        <Button variant='primary' onClick={action}>
          <Lucide.Plus className='size-4' />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title='Network Error'
      message='Unable to connect to server. Please check your internet connection and try again.'
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
