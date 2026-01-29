import { useForm } from '@tanstack/react-form'
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Avatar, AvatarFallback } from '~/app/components/avatar'
import { Button } from '~/app/components/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/app/components/card'
import { Field, FieldLabel } from '~/app/components/field'
import { Heading } from '~/app/components/heading'
import { Input } from '~/app/components/input'
import { Spinner } from '~/app/components/spinner'
import { Tabs, TabsList, TabsItem, TabsPanel } from '~/app/components/tabs'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'
import type { UserProfileResponse } from '~/app/types/api'
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
          <Card id='profile-info'>
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                profileForm.handleSubmit()
              }}
            >
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account information below</CardDescription>
              </CardHeader>
              <CardBody className='pt-2'>
                <profileForm.Field
                  name='name'
                  validators={{
                    onChange: ({ value }) => {
                      const result = profileSchema.shape.name.safeParse(value)
                      if (!result.success) {
                        const firstError = result.error.issues[0]
                        return firstError ? firstError.message : undefined
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='name'>Full Name</FieldLabel>
                      <Input
                        id='name'
                        name={field.name}
                        type='text'
                        autoComplete='name'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='John Doe'
                        disabled={updateProfileMutation.isPending}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </Text>
                      )}
                    </Field>
                  )}
                </profileForm.Field>
              </CardBody>
              <CardFooter className='flex justify-end gap-3'>
                <Button type='button' variant='secondary' onClick={() => profileForm.reset()}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={
                    !profileForm.state.canSubmit ||
                    profileForm.state.isSubmitting ||
                    updateProfileMutation.isPending
                  }
                >
                  {profileForm.state.isSubmitting || updateProfileMutation.isPending ? (
                    <span className='flex items-center gap-2'>
                      <Spinner className='size-4' />
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card id='change-email'>
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                changeEmailForm.handleSubmit()
              }}
            >
              <CardHeader>
                <CardTitle>Email Address</CardTitle>
                <CardDescription>
                  Update your email address for account notifications and login
                </CardDescription>
              </CardHeader>
              <CardBody className='space-y-6 pt-2'>
                {changeEmailMutation.isSuccess && (
                  <Alert variant='success'>
                    <div className='space-y-1'>
                      <p className='font-medium'>Email change request sent!</p>
                      <Text className='text-sm opacity-90'>
                        We've sent a confirmation link to your new email address.
                      </Text>
                    </div>
                  </Alert>
                )}

                {changeEmailMutation.error && (
                  <Alert variant='danger'>
                    {changeEmailMutation.error instanceof Error
                      ? changeEmailMutation.error.message
                      : 'Failed to request email change. Please try again.'}
                  </Alert>
                )}

                <Field>
                  <FieldLabel htmlFor='currentEmail'>Current Email Address</FieldLabel>
                  <Input
                    id='currentEmail'
                    name='currentEmail'
                    type='email'
                    autoComplete='email'
                    value={profileData?.data?.email || 'Unknown'}
                    placeholder={profileData?.data?.email || 'Unknown'}
                    className='bg-accent'
                    disabled
                    readOnly
                  />
                </Field>

                <changeEmailForm.Field
                  name='newEmail'
                  validators={{
                    onChange: ({ value }) => {
                      const result = changeEmailSchema.shape.newEmail.safeParse(value)
                      if (!result.success) {
                        const firstError = result.error.issues[0]
                        return firstError ? firstError.message : undefined
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='newEmail'>New Email Address</FieldLabel>
                      <Input
                        id='newEmail'
                        name={field.name}
                        type='email'
                        autoComplete='email'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='new.email@example.com'
                        disabled={changeEmailMutation.isPending}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </Text>
                      )}
                    </Field>
                  )}
                </changeEmailForm.Field>

                <changeEmailForm.Field
                  name='password'
                  validators={{
                    onChange: ({ value }) => {
                      const result = changeEmailSchema.shape.password.safeParse(value)
                      if (!result.success) {
                        const firstError = result.error.issues[0]
                        return firstError ? firstError.message : undefined
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='password'>Current Password</FieldLabel>
                      <Input
                        id='password'
                        name={field.name}
                        type='password'
                        autoComplete='current-password'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='••••••••'
                        disabled={changeEmailMutation.isPending}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </Text>
                      )}
                    </Field>
                  )}
                </changeEmailForm.Field>
              </CardBody>
              <CardFooter className='flex justify-end gap-3'>
                <Button type='button' variant='secondary' onClick={() => changeEmailForm.reset()}>
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={
                    !changeEmailForm.state.canSubmit ||
                    changeEmailForm.state.isSubmitting ||
                    changeEmailMutation.isPending
                  }
                >
                  {changeEmailForm.state.isSubmitting || changeEmailMutation.isPending ? (
                    <span className='flex items-center gap-2'>
                      <Spinner className='size-4' />
                      Sending...
                    </span>
                  ) : (
                    'Send Confirmation'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsPanel>

        <TabsPanel value='security' className='mt-4 space-y-8'>
          <Card id='change-password'>
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                changePasswordForm.handleSubmit()
              }}
            >
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Ensure your account is using a long, random password to stay secure
                </CardDescription>
              </CardHeader>
              <CardBody className='space-y-6 pt-2'>
                {changePasswordMutation.isSuccess && (
                  <Alert variant='success'>
                    Password changed successfully! All sessions have been terminated for security.
                  </Alert>
                )}

                {changePasswordMutation.error && (
                  <Alert variant='danger'>
                    {changePasswordMutation.error instanceof Error
                      ? changePasswordMutation.error.message
                      : 'Failed to change password. Please try again.'}
                  </Alert>
                )}

                <changePasswordForm.Field
                  name='currentPassword'
                  validators={{
                    onChange: ({ value }) => {
                      const result = changePasswordSchema.shape.currentPassword.safeParse(value)
                      if (!result.success) {
                        const firstError = result.error.issues[0]
                        return firstError ? firstError.message : undefined
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='currentPassword'>Current Password</FieldLabel>
                      <Input
                        id='currentPassword'
                        name={field.name}
                        type='password'
                        autoComplete='current-password'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='••••••••'
                        disabled={changePasswordMutation.isPending}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </Text>
                      )}
                    </Field>
                  )}
                </changePasswordForm.Field>

                <changePasswordForm.Field
                  name='newPassword'
                  validators={{
                    onChange: ({ value, fieldApi }) => {
                      const result = changePasswordSchema.shape.newPassword.safeParse(value)
                      if (!result.success) {
                        const firstError = result.error.issues[0]
                        return firstError ? firstError.message : undefined
                      }

                      const confirmPasswordValue = fieldApi.form.getFieldValue('confirmPassword')
                      if (confirmPasswordValue && confirmPasswordValue !== value) {
                        fieldApi.form.setFieldValue('confirmPassword', confirmPasswordValue)
                      }

                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='newPassword'>New Password</FieldLabel>
                      <Input
                        id='newPassword'
                        name={field.name}
                        type='password'
                        autoComplete='new-password'
                        strengthIndicator
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='••••••••'
                        disabled={changePasswordMutation.isPending}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </Text>
                      )}
                    </Field>
                  )}
                </changePasswordForm.Field>

                <changePasswordForm.Field
                  name='confirmPassword'
                  validators={{
                    onChange: ({ value, fieldApi }) => {
                      if (!value || value.trim() === '') {
                        return 'Please confirm your new password'
                      }

                      const passwordValue = fieldApi.form.getFieldValue('newPassword')

                      if (value !== passwordValue) {
                        return 'Passwords do not match'
                      }

                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='confirmPassword'>Confirm New Password</FieldLabel>
                      <Input
                        id='confirmPassword'
                        name={field.name}
                        type='password'
                        autoComplete='new-password'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder='••••••••'
                        disabled={changePasswordMutation.isPending}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <Text className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </Text>
                      )}
                    </Field>
                  )}
                </changePasswordForm.Field>
              </CardBody>
              <CardFooter className='flex justify-end gap-3'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => changePasswordForm.reset()}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={
                    !changePasswordForm.state.canSubmit ||
                    changePasswordForm.state.isSubmitting ||
                    changePasswordMutation.isPending
                  }
                >
                  {changePasswordForm.state.isSubmitting || changePasswordMutation.isPending ? (
                    <span className='flex items-center gap-2'>
                      <Spinner className='size-4' />
                      Changing...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsPanel>

        <TabsPanel value='sessions' className='mt-4 space-y-8'>
          <SessionsPanel queryClient={queryClient} />
        </TabsPanel>
      </Tabs>
    </div>
  )
}
