import { useMutation, useQuery } from '@tanstack/react-query'
import { decodeJwt } from 'jose'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { Alert } from '~/app/components/alert'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogPopup,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '~/app/components/alert-dialog'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/app/components/card'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'
import { authStore } from '~/app/stores'
import { clx } from '~/app/utils'

export function SessionsPanel({ queryClient }: { queryClient: any }) {
  const [revokeOthersDialog, setRevokeOthersDialog] = useState(false)
  const [revokeAllDialog, setRevokeAllDialog] = useState(false)

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

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return fetcher('/auth/sessions', {
        method: 'DELETE',
        body: { session_id: sessionId }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    }
  })

  const revokeAllOtherSessionsMutation = useMutation({
    mutationFn: async () => {
      return fetcher('/auth/sessions/others', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      setRevokeOthersDialog(false)
    }
  })

  const revokeAllSessionsMutation = useMutation({
    mutationFn: async () => {
      return fetcher('/auth/sessions/all', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
      setRevokeAllDialog(false)
    }
  })

  const handleRevokeAllOtherSessions = () => {
    setRevokeOthersDialog(true)
  }

  const handleRevokeAllSessions = () => {
    setRevokeAllDialog(true)
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
          <Spinner className='size-5' />
          <Text>Loading sessions...</Text>
        </div>
      </div>
    )
  }

  if (error) {
    return <Alert variant='danger'>Failed to load sessions. Please try again later.</Alert>
  }

  const sessions = sessionsData?.data?.sessions || []

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across devices ({sessions.length})
          </CardDescription>
        </CardHeader>
        <CardBody>
          {revokeAllOtherSessionsMutation.isSuccess && (
            <Alert variant='success'>All other sessions have been revoked successfully!</Alert>
          )}

          {revokeAllSessionsMutation.isSuccess && (
            <Alert variant='success'>All sessions have been revoked successfully!</Alert>
          )}

          <React.Activity mode={sessions.length === 0 ? 'visible' : 'hidden'}>
            <div className='flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12 text-center'>
              <Lucide.Smartphone className='mb-4 h-12 w-12 text-gray-400' />
              <Text className='text-lg font-medium text-gray-900'>No active sessions</Text>
              <Text className='mt-2 text-gray-500'>
                You don't have any active sessions at moment.
              </Text>
            </div>
          </React.Activity>

          <React.Activity mode={sessions.length >= 1 ? 'visible' : 'hidden'}>
            <div className='space-y-4'>
              {sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={clx(
                    'flex items-center gap-4 rounded-lg border p-4',
                    session.session_id === currentSessionId
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className='flex flex-1 items-center gap-3'>
                    <Lucide.Smartphone className='size-4 text-gray-500' />
                    <div className='flex flex-col gap-1'>
                      <div className='flex items-center gap-2'>
                        <Text className='font-medium text-gray-900'>
                          {session.device_info || 'Unknown Device'}
                        </Text>
                        {session.session_id === currentSessionId && (
                          <Badge variant='success'>Current</Badge>
                        )}
                      </div>
                      <div className='flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:gap-4'>
                        <span className='flex items-center gap-1'>
                          <Lucide.MapPin className='size-3' />
                          {session.ip_address || 'Unknown IP'}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Lucide.Clock className='size-3' />
                          Last active: {formatRelativeTime(session.last_activity_at)}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Lucide.Calendar className='size-3' />
                          {formatDate(session.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {session.session_id !== currentSessionId && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            size='xs'
                            type='button'
                            variant='danger'
                            disabled={revokeSessionMutation.isPending}
                          >
                            Revoke
                          </Button>
                        }
                      />
                      <AlertDialogPopup>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Session</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogBody>
                          <AlertDialogDescription>
                            Are you sure you want to revoke this session?
                          </AlertDialogDescription>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                          <AlertDialogClose>Cancel</AlertDialogClose>
                          <AlertDialogClose
                            render={
                              <Button
                                variant='danger'
                                onClick={() => revokeSessionMutation.mutate(session.session_id)}
                              >
                                Revoke
                              </Button>
                            }
                          />
                        </AlertDialogFooter>
                      </AlertDialogPopup>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </div>
          </React.Activity>
        </CardBody>

        <CardFooter className='flex justify-end gap-3'>
          <Button
            type='button'
            variant='secondary'
            onClick={handleRevokeAllOtherSessions}
            disabled={revokeAllOtherSessionsMutation.isPending || sessions.length <= 1}
          >
            {revokeAllOtherSessionsMutation.isPending ? 'Revoking...' : 'Revoke Others'}
          </Button>
          <Button
            type='button'
            variant='danger'
            onClick={handleRevokeAllSessions}
            disabled={revokeAllSessionsMutation.isPending || sessions.length === 0}
          >
            {revokeAllSessionsMutation.isPending ? 'Revoking...' : 'Revoke All'}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={revokeOthersDialog} onOpenChange={setRevokeOthersDialog}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Other Sessions</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to revoke all other sessions? <br />
              You will be logged out from all other devices.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button variant='danger' onClick={() => revokeAllOtherSessionsMutation.mutate()}>
                  Revoke All Others
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog open={revokeAllDialog} onOpenChange={setRevokeAllDialog}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to revoke all sessions? <br />
              You will be logged out from all devices including this one.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button variant='danger' onClick={() => revokeAllSessionsMutation.mutate()}>
                  Revoke All
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  )
}
