import * as Lucide from 'lucide-react'
import { Alert, AlertTitle, AlertDescription, AlertAction } from '~/app/components/alert'
import { useAuth } from './context'

/**
 * SessionExpiredAlert component displays a notification when user's session has expired.
 * It automatically dismisses after 2 seconds or can be manually dismissed.
 *
 * This component should be placed in the root layout or app layout to show session expired messages.
 */
export function SessionExpiredAlert() {
  const { sessionExpired, dismissSessionExpired } = useAuth()

  if (!sessionExpired) {
    return null
  }

  return (
    <div className='fixed inset-x-0 top-4 z-50 mx-auto max-w-md px-4'>
      <Alert variant='warning'>
        <Lucide.AlertTriangle className='size-5' aria-hidden='true' />
        <AlertTitle>Session expired</AlertTitle>
        <AlertDescription>Please sign in again to continue</AlertDescription>
        <AlertAction>
          <button
            type='button'
            onClick={dismissSessionExpired}
            className='rounded-md p-1 hover:bg-white/20 focus:ring-2 focus:ring-amber-500 focus:outline-none'
            aria-label='Dismiss'
          >
            <Lucide.X className='size-4' aria-hidden='true' />
          </button>
        </AlertAction>
      </Alert>
    </div>
  )
}
