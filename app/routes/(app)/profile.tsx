import { useForm } from '@tanstack/react-form'
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Avatar, AvatarFallback } from '~/app/components/avatar'
import { Heading } from '~/app/components/heading'
import { Spinner } from '~/app/components/spinner'
import { Tabs, TabsList, TabsItem, TabsPanel } from '~/app/components/tabs'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'
import type { UserProfileResponse } from '~/app/types/api'
import { ChangeEmailCard } from './-profile/change-email-card'
import { ChangePasswordCard } from './-profile/change-password-card'
import { ProfileInfoCard } from './-profile/profile-info-card'
import { SessionsPanel } from './-profile/sessions-panel'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters')
})

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

const changeEmailSchema = z.object({
  newEmail: z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required')
})

const whoamiQuery = queryOptions({
  queryKey: ['whoami'],
  queryFn: () => fetcher<UserProfileResponse>('/auth/whoami')
})

export const Route = createFileRoute('/(app)/profile')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

  const { data: profileData, isLoading } = useSuspenseQuery(whoamiQuery)

  const updateProfileMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      return fetcher('/user/profile', {
        method: 'PUT',
        body: { name: values.name }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: async (values: { current_password: string; new_password: string }) => {
      return fetcher('/auth/password/change', {
        method: 'POST',
        body: {
          current_password: values.current_password,
          new_password: values.new_password
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const changeEmailMutation = useMutation({
    mutationFn: async (values: { new_email: string; password: string }) => {
      return fetcher('/user/email/change', {
        method: 'POST',
        body: {
          new_email: values.new_email,
          password: values.password
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const profileForm = useForm({
    defaultValues: { name: profileData?.data?.name || '' },
    onSubmit: async ({ value }) => {
      const result = profileSchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          profileForm.setFieldValue('name', value.name)
          throw new Error(firstError.message)
        }
        return
      }
      await updateProfileMutation.mutateAsync(value)
    }
  })

  const changePasswordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      const result = changePasswordSchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }
      await changePasswordMutation.mutateAsync({
        current_password: value.currentPassword,
        new_password: value.newPassword
      })
    }
  })

  const changeEmailForm = useForm({
    defaultValues: { newEmail: '', password: '' },
    onSubmit: async ({ value }) => {
      const result = changeEmailSchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }
      await changeEmailMutation.mutateAsync({
        new_email: value.newEmail,
        password: value.password
      })
    }
  })

  if (profileData?.data?.name && profileForm.state.values.name !== profileData.data.name) {
    profileForm.setFieldValue('name', profileData.data.name)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-500'>
          <Spinner className='size-5' />
          <Text>Loading...</Text>
        </div>
      </div>
    )
  }

  const initials = profileData?.data?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className='mx-auto w-full max-w-4xl space-y-8'>
      <div className='flex items-start gap-6'>
        <Avatar className='size-14 shrink-0'>
          <AvatarFallback className='bg-gray-100 text-xl font-semibold text-gray-700'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 space-y-1'>
          <Heading level={1}>{profileData?.data?.name || 'User'}</Heading>
          <Text className='text-dimmed font-mono text-sm font-medium'>
            {profileData?.data?.user_id || ''}
          </Text>
        </div>
      </div>

      <Tabs defaultValue='general'>
        <TabsList>
          <TabsItem value='general'>General</TabsItem>
          <TabsItem value='security'>Security</TabsItem>
          <TabsItem value='sessions'>Sessions</TabsItem>
        </TabsList>

        <React.Activity
          mode={
            updateProfileMutation.isSuccess || updateProfileMutation.error ? 'visible' : 'hidden'
          }
        >
          <div className='mt-4'>
            {updateProfileMutation.isSuccess && (
              <Alert variant='success'>Profile updated successfully!</Alert>
            )}

            {updateProfileMutation.error && (
              <Alert variant='danger'>
                {updateProfileMutation.error instanceof Error
                  ? updateProfileMutation.error.message
                  : 'Failed to update profile. Please try again.'}
              </Alert>
            )}
          </div>
        </React.Activity>

        <TabsPanel value='general' className='mt-4 space-y-8'>
          <ProfileInfoCard
            profileForm={profileForm}
            updateProfileMutation={updateProfileMutation}
            profileData={profileData}
          />
          <ChangeEmailCard
            changeEmailForm={changeEmailForm}
            changeEmailMutation={changeEmailMutation}
            profileData={profileData}
          />
        </TabsPanel>

        <TabsPanel value='security' className='mt-4 space-y-8'>
          <ChangePasswordCard
            changePasswordForm={changePasswordForm}
            changePasswordMutation={changePasswordMutation}
          />
        </TabsPanel>

        <TabsPanel value='sessions' className='mt-4 space-y-8'>
          <SessionsPanel queryClient={queryClient} />
        </TabsPanel>
      </Tabs>
    </div>
  )
}
