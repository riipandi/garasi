import * as Lucide from 'lucide-react'
import { useAuth } from '~/app/guards'

/**
 * SessionExpiredAlert component displays a notification when the user's session has expired.
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
      <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg'>
        <Lucide.AlertTriangle className='size-5 shrink-0 text-amber-600' />
        <div className='flex-1'>
          <p className='text-sm font-medium text-amber-800'>Session expired</p>
          <p className='text-xs text-amber-700'>Please sign in again to continue</p>
        </div>
        <button
          type='button'
          onClick={dismissSessionExpired}
          className='shrink-0 rounded-md p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-800'
          aria-label='Dismiss'
        >
          <Lucide.X className='size-4' />
        </button>
      </div>
    </div>
  )
}
