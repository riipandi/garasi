import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { decodeJwt } from 'jose'
import * as Lucide from 'lucide-react'
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
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { IconBox } from '~/app/components/icon-box'
import { Item, ItemContent, ItemMedia, ItemTitle, ItemDescription, ItemAction } from '~/app/components/item'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'
import { authStore } from '~/app/stores'

export const Route = createFileRoute('/(app)/profile/sessions')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
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
    return (
      <div className='mx-auto w-full max-w-4xl'>
        <Alert variant='danger'>Failed to load sessions. Please try again later.</Alert>
      </div>
    )
  }

  const sessions = sessionsData?.data?.sessions || []

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle>Active Sessions</CardTitle>
              <Text className='mt-2'>Manage your active sessions across devices</Text>
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='secondary'
                size='sm'
                onClick={handleRevokeAllOtherSessions}
                disabled={revokeAllOtherSessionsMutation.isPending || sessions.length <= 1}
              >
                {revokeAllOtherSessionsMutation.isPending ? 'Revoking...' : 'Revoke Others'}
              </Button>
              <Button
                type='button'
                variant='danger'
                size='sm'
                onClick={handleRevokeAllSessions}
                disabled={revokeAllSessionsMutation.isPending || sessions.length === 0}
              >
                {revokeAllSessionsMutation.isPending ? 'Revoking...' : 'Revoke All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {revokeAllOtherSessionsMutation.isSuccess && (
            <Alert variant='success'>All other sessions have been revoked successfully!</Alert>
          )}

          {revokeAllSessionsMutation.isSuccess && (
            <Alert variant='success'>All sessions have been revoked successfully!</Alert>
          )}

          {sessions.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <Lucide.Smartphone className='mb-4 h-12 w-12 text-gray-400' />
              <Text className='text-lg font-medium text-gray-900'>No active sessions</Text>
              <Text className='mt-2 text-gray-500'>
                You don't have any active sessions at moment.
              </Text>
            </div>
          ) : (
            <Stack>
              {sessions.map((session) => (
                <Item
                  key={session.session_id}
                  variant={session.session_id === currentSessionId ? 'info' : 'default'}
                  className={
                    session.session_id === currentSessionId
                      ? 'border-blue-200 bg-blue-50'
                      : 'bg-white'
                  }
                >
                  <ItemMedia>
                    <Lucide.Smartphone className='size-4 text-gray-500' />
                  </ItemMedia>
                  <ItemContent>
                    <div className='flex items-center gap-2'>
                      <ItemTitle>{session.device_info || 'Unknown Device'}</ItemTitle>
                      {session.session_id === currentSessionId && (
                        <Badge variant='success'>Current</Badge>
                      )}
                    </div>
                    <ItemDescription>
                      <div className='flex flex-col gap-1 sm:flex-row sm:gap-4'>
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
                    </ItemDescription>
                  </ItemContent>
                  {session.session_id !== currentSessionId && (
                    <ItemAction>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              type='button'
                              variant='danger'
                              size='xs'
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
                    </ItemAction>
                  )}
                </Item>
              ))}
            </Stack>
          )}
        </CardBody>
      </Card>

      <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
        <div className='flex gap-3'>
          <IconBox variant='info' className='mt-0.5 size-5 shrink-0'>
            <Lucide.Info className='size-3' />
          </IconBox>
          <div>
            <Text className='font-medium text-blue-900'>About sessions</Text>
            <Text className='mt-1 text-xs text-blue-700'>
              Sessions represent your signed-in devices. You can revoke sessions to sign out from
              specific devices. Revoking current session will sign you out from this device.
            </Text>
          </div>
        </div>
      </div>

      <AlertDialog open={revokeOthersDialog} onOpenChange={setRevokeOthersDialog}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Other Sessions</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to revoke all other sessions? You will be logged out from all other devices.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={() => revokeAllOtherSessionsMutation.mutate()}
                >
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
              Are you sure you want to revoke all sessions? You will be logged out from all devices including this one.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={() => revokeAllSessionsMutation.mutate()}
                >
                  Revoke All
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  )
}
