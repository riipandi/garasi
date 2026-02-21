import { useNavigate } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Activity, useEffect, useState } from 'react'
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
import { Card, CardBody, CardHeaderAction, CardTitle } from '~/app/components/card'
import { CardDescription, CardFooter, CardHeader } from '~/app/components/card'
import { Input } from '~/app/components/input'
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '~/app/components/item'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { useAuth } from '~/app/guards'
import authService from '~/app/services/auth.service'
import { clx } from '~/app/utils'

interface Session {
  id: string
  ip_address: string
  device_info: string
  last_activity_at: number
  expires_at: number
  created_at: number
  is_current: boolean
}

interface SessionsCardProps {
  onNotification: (type: 'success' | 'error', message: string) => void
}

export function SessionsCard({ onNotification }: SessionsCardProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true)
      const response = await authService.getUserSessions()
      const fetchedSessions =
        response.status === 'success' && response.data ? response.data.sessions : []
      setSessions(fetchedSessions)
      setIsLoading(false)
    }

    fetchSessions()
  }, [])

  const handleRevokeSession = async (sessionId: string, isCurrent: boolean) => {
    const response = await authService.revokeSession(sessionId)
    const success = response.status === 'success'
    if (success) {
      if (isCurrent) {
        onNotification('success', 'Current session revoked. Please sign in again.')
        await logout()
        navigate({ to: '/signin' })
      } else {
        setSessions(sessions.filter((s) => s.id !== sessionId))
        onNotification('success', 'Session revoked successfully')
      }
    } else {
      onNotification('error', 'Failed to revoke session')
    }
  }

  const handleRevokeOthers = async () => {
    const response = await authService.revokeOtherSessions()
    const success = response.status === 'success'
    if (success) {
      setSessions(sessions.filter((s) => s.is_current))
      onNotification('success', 'Other sessions revoked successfully')
    } else {
      onNotification('error', 'Failed to revoke other sessions')
    }
  }

  const handleRevokeAll = async () => {
    const response = await authService.revokeAllSessions()
    const success = response.status === 'success'
    if (success) {
      setSessions([])
      onNotification('success', 'All sessions revoked successfully')
      await logout()
      navigate({ to: '/signin' })
    } else {
      onNotification('error', 'Failed to revoke all sessions')
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.device_info.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ip_address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage your active sessions across devices ({filteredSessions.length})
          </CardDescription>
          <CardHeaderAction className='gap-2'>
            <Button
              size='icon'
              variant='plain'
              className='w-12'
              onClick={() => console.info('refecth session')}
            >
              <Lucide.RefreshCcw className='text-muted size-5' />
            </Button>
            <Input
              placeholder='Find session'
              className='min-w-60'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </CardHeaderAction>
        </CardHeader>
        <CardBody className='p-12'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Spinner className='size-6' strokeWidth={2.0} />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Lucide.Shield className='text-dimmed mb-4 size-12' />
              <Text className='text-dimmed'>No active sessions found</Text>
            </div>
          ) : (
            <Stack spacing='md'>
              {filteredSessions.map((session) => {
                return (
                  <Item key={session.id} variant={session.is_current ? 'info-outline' : 'default'}>
                    <ItemMedia className='flex items-center'>
                      <Lucide.Laptop
                        className={clx('size-8', session.is_current ? 'text-info' : 'text-dimmed')}
                      />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{session.device_info || 'Unknown Device'}</ItemTitle>
                      <ItemDescription>
                        {session.ip_address} • Last active {formatDate(session.last_activity_at)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemAction>
                      {session.is_current && (
                        <Badge variant='info-outline' size='sm'>
                          Current
                        </Badge>
                      )}
                      {!session.is_current && (
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant='plain' size='sm'>
                                Revoke
                              </Button>
                            }
                          />
                          <AlertDialogPopup>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke session</AlertDialogTitle>
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
                                    onClick={() =>
                                      handleRevokeSession(session.id, session.is_current)
                                    }
                                  >
                                    Revoke
                                  </Button>
                                }
                              />
                            </AlertDialogFooter>
                          </AlertDialogPopup>
                        </AlertDialog>
                      )}

                      <Activity mode={session.is_current ? 'visible' : 'hidden'}>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button variant='plain' size='sm'>
                                Revoke
                              </Button>
                            }
                          />
                          <AlertDialogPopup>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke current session?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogBody>
                              <AlertDialogDescription>
                                This will sign you out of this device immediately.
                                <br /> You will need to sign in again to continue.
                              </AlertDialogDescription>
                            </AlertDialogBody>
                            <AlertDialogFooter>
                              <AlertDialogClose>Cancel</AlertDialogClose>
                              <AlertDialogClose
                                render={
                                  <Button
                                    variant='danger'
                                    onClick={() =>
                                      handleRevokeSession(session.id, session.is_current)
                                    }
                                  >
                                    Sign Out
                                  </Button>
                                }
                              />
                            </AlertDialogFooter>
                          </AlertDialogPopup>
                        </AlertDialog>
                      </Activity>
                    </ItemAction>
                  </Item>
                )
              })}
            </Stack>
          )}
        </CardBody>
        <CardFooter className='justify-end space-x-2'>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant='tertiary'>Revoke Others</Button>} />
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke other sessions</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogBody>
                <AlertDialogDescription>
                  Are you sure you want to revoke all other sessions? <br />
                  This will sign you out of all other devices.
                </AlertDialogDescription>
              </AlertDialogBody>
              <AlertDialogFooter>
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose
                  render={
                    <Button variant='danger' onClick={handleRevokeOthers}>
                      Revoke
                    </Button>
                  }
                />
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger render={<Button variant='danger'>Revoke All</Button>} />
            <AlertDialogPopup>
              <AlertDialogHeader>
                <AlertDialogTitle>Revoke all sessions?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogBody>
                <AlertDialogDescription>
                  This will sign you out of all devices including this one.
                  <br /> You will need to sign in again to continue.
                </AlertDialogDescription>
              </AlertDialogBody>
              <AlertDialogFooter>
                <AlertDialogClose>Cancel</AlertDialogClose>
                <AlertDialogClose
                  render={
                    <Button variant='danger' onClick={handleRevokeAll}>
                      Revoke All
                    </Button>
                  }
                />
              </AlertDialogFooter>
            </AlertDialogPopup>
          </AlertDialog>
        </CardFooter>
      </Card>
    </>
  )
}
