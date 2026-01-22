import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { decodeJwt } from 'jose'
import * as Lucide from 'lucide-react'
import { Alert } from '~/app/components/alert'
import { fetcher } from '~/app/fetcher'
import { authStore } from '~/app/stores'

export const Route = createFileRoute('/(app)/profile/sessions')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

  // Get current session ID from access token
  const currentSessionId = (() => {
    try {
      const token = authStore.get().atoken
      if (!token) return null
      const payload = decodeJwt<{ sid?: string }>(token)
      return payload?.sid || null
    } catch {
      return null
    }
  })()

  // Fetch user sessions
  const {
    data: sessionsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () =>
      fetcher<{
        success: boolean
        data: {
          sessions: Array<{
            session_id: string
            ip_address: string
            device_info: string
            last_activity_at: number
            expires_at: number
            created_at: number
          }>
        }
      }>('/auth/sessions')
  })

  // Revoke session mutation
  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return fetcher('/auth/sessions', {
        method: 'DELETE',
        body: { session_id: sessionId }
      })
    },
    onSuccess: () => {
      // Invalidate sessions query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })

  // Revoke all other sessions mutation
  const revokeAllOtherSessionsMutation = useMutation({
    mutationFn: async () => {
      return fetcher('/auth/sessions/others', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      // Invalidate sessions query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })

  // Revoke all sessions mutation
  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      return fetcher('/auth/sessions/all', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      // Invalidate sessions query to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })

  const handleRevokeSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      await revokeSessionMutation.mutateAsync(sessionId)
    }
  }

  const handleRevokeAllOtherSessions = async () => {
    if (
      confirm(
        'Are you sure you want to revoke all other sessions? You will be logged out from all other devices.'
      )
    ) {
      await revokeAllOtherSessionsMutation.mutateAsync()
    }
  }

  const handleRevokeAllSessions = async () => {
    if (
      confirm(
        'Are you sure you want to revoke all sessions? You will be logged out from all devices including this one.'
      )
    ) {
      await revokeAllSessionsMutation.mutateAsync()
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (timestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - timestamp

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-500'>
          <svg className='h-5 w-5 animate-spin' fill='none' viewBox='0 0 24 24'>
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          <span>Loading sessions...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='mx-auto w-full max-w-4xl'>
        <Alert type='error'>Failed to load sessions. Please try again later.</Alert>
      </div>
    )
  }

  const sessions = sessionsData?.data?.sessions || []

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Active Sessions</h2>
            <p className='text-normal mt-2 text-gray-500'>
              Manage your active sessions across devices
            </p>
          </div>
          <div className='flex gap-2'>
            <button
              type='button'
              onClick={handleRevokeAllOtherSessions}
              disabled={revokeAllOtherSessionsMutation.isPending || sessions.length <= 1}
              className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4'
            >
              {revokeAllOtherSessionsMutation.isPending ? 'Revoking...' : 'Revoke Others'}
            </button>
            <button
              type='button'
              onClick={handleRevokeAllSessions}
              disabled={revokeAllSessionsMutation.isPending || sessions.length === 0}
              className='rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4'
            >
              {revokeAllSessionsMutation.isPending ? 'Revoking...' : 'Revoke All'}
            </button>
          </div>
        </div>

        {revokeAllOtherSessionsMutation.isSuccess && (
          <div className='mb-4'>
            <Alert type='success'>All other sessions have been revoked successfully!</Alert>
          </div>
        )}

        {revokeAllSessionsMutation.isSuccess && (
          <div className='mb-4'>
            <Alert type='success'>All sessions have been revoked successfully!</Alert>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <Lucide.Smartphone className='mb-4 h-12 w-12 text-gray-400' />
            <h3 className='text-lg font-medium text-gray-900'>No active sessions</h3>
            <p className='text-normal mt-2 text-gray-500'>
              You don't have any active sessions at the moment.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {sessions.map((session) => (
              <div
                key={session.session_id}
                className={`rounded-lg border p-4 ${
                  session.session_id === currentSessionId
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex-1 space-y-1'>
                    <div className='flex items-center gap-2'>
                      <h3 className='text-sm font-medium text-gray-900'>
                        {session.device_info || 'Unknown Device'}
                      </h3>
                      {session.session_id === currentSessionId && (
                        <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800'>
                          Current
                        </span>
                      )}
                    </div>
                    <div className='flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:gap-4'>
                      <span className='flex items-center gap-1'>
                        <Lucide.MapPin className='h-3 w-3' />
                        {session.ip_address || 'Unknown IP'}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Lucide.Clock className='h-3 w-3' />
                        Last active: {formatRelativeTime(session.last_activity_at)}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Lucide.Calendar className='h-3 w-3' />
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </div>
                  {session.session_id !== currentSessionId && (
                    <button
                      type='button'
                      onClick={() => handleRevokeSession(session.session_id)}
                      disabled={revokeSessionMutation.isPending}
                      className='rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
        <div className='flex gap-3'>
          <Lucide.Info className='mt-0.5 h-5 w-5 shrink-0 text-blue-600' />
          <div>
            <h4 className='text-sm font-medium text-blue-900'>About sessions</h4>
            <p className='mt-1 text-xs text-blue-700'>
              Sessions represent your signed-in devices. You can revoke sessions to sign out from
              specific devices. Revoking current session will sign you out from this device.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
