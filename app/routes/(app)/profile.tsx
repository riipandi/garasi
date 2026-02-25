import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Avatar, AvatarFallbackInitial } from '~/app/components/avatar'
import { Tabs, TabsItem, TabsList, TabsPanel } from '~/app/components/tabs'
import { Heading, Text } from '~/app/components/typography'
import { fetcher } from '~/app/fetcher'
import { useAuth } from '~/app/guards'
import { ChangeEmailCard } from './-profile/email-card'
import { ChangePasswordCard } from './-profile/password-card'
import { ProfileInfoCard } from './-profile/profile-card'
import { SessionsCard } from './-profile/sessions-card'

// Query options for user profile data
export const userProfileQueryOptions = queryOptions({
  queryKey: ['user', 'profile'],
  queryFn: async () => {
    const response = await fetcher<{
      status: 'success' | 'error'
      message: string
      data: { user_id: string; email: string; name: string } | null
      error: any
    }>('/auth/whoami')

    if (response.status !== 'success' || !response.data) {
      throw new Error(response.message || 'Failed to fetch user profile')
    }

    return {
      id: response.data.user_id,
      email: response.data.email,
      name: response.data.name
    }
  }
})

type NotificationType = 'success' | 'error'

interface NotificationState {
  type: NotificationType | null
  message: string | null
}

const searchSchema = z.object({
  tab: z.enum(['general', 'security', 'sessions']).optional()
})

export const Route = createFileRoute('/(app)/profile')({
  component: RouteComponent,
  validateSearch: searchSchema,
  loader: ({ context }) => {
    // Prefetch user profile data before render
    context.queryClient.ensureQueryData(userProfileQueryOptions)
  }
})

function useNotification() {
  const [notification, setNotification] = React.useState<NotificationState>({
    type: null,
    message: null
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification({ type: null, message: null }), 5000)
  }

  return { notification, showNotification }
}

function RouteComponent() {
  const { user } = useAuth()
  const { notification, showNotification } = useNotification()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const activeTab = search.tab || 'general'

  const handleTabChange = (value: 'general' | 'security' | 'sessions') => {
    navigate({ search: (prev) => ({ ...prev, tab: value }) })
  }

  // Fetch user profile data using TanStack Query
  const { data: profileData } = useSuspenseQuery(userProfileQueryOptions)

  // Use profile data from query, fallback to auth context user
  const displayUser = profileData || user

  return (
    <div className='mx-auto max-w-4xl space-y-6 p-2 lg:px-6 lg:py-2'>
      <div className='flex items-start gap-6 py-2'>
        <Avatar className='size-14 shrink-0'>
          <AvatarFallbackInitial
            name={displayUser?.name}
            className='bg-dimmed/5 text-xl font-semibold text-gray-700'
          />
        </Avatar>
        <div className='flex-1 space-y-1'>
          <Heading level={1}>{displayUser?.name || 'User'}</Heading>
          <Text className='text-dimmed font-mono text-sm font-medium'>
            {displayUser?.id || displayUser?.email || 'unknown'}
          </Text>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsItem value='general'>General</TabsItem>
          <TabsItem value='security'>Security</TabsItem>
          <TabsItem value='sessions'>Sessions</TabsItem>
        </TabsList>

        <React.Activity mode={notification.type ? 'visible' : 'hidden'}>
          <div className='mt-4'>
            {notification.type === 'success' && notification.message && (
              <Alert variant='success'>
                <Lucide.CheckIcon />
                {notification.message}
              </Alert>
            )}
            {notification.type === 'error' && notification.message && (
              <Alert variant='danger'>
                <Lucide.XIcon />
                {notification.message}
              </Alert>
            )}
          </div>
        </React.Activity>

        <TabsPanel value='general' className='mt-4 space-y-8'>
          <ProfileInfoCard onNotification={showNotification} />
          <ChangeEmailCard onNotification={showNotification} />
        </TabsPanel>

        <TabsPanel value='security' className='mt-4 space-y-8'>
          <ChangePasswordCard onNotification={showNotification} />
        </TabsPanel>

        <TabsPanel value='sessions' className='mt-4 space-y-8'>
          <SessionsCard onNotification={showNotification} />
        </TabsPanel>
      </Tabs>
    </div>
  )
}
