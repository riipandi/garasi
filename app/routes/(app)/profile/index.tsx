import { useForm } from '@tanstack/react-form'
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Field, FieldLabel } from '~/app/components/field'
import { Input } from '~/app/components/input'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'
import type { UserProfileResponse } from '~/app/types/api'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters')
})

const whoamiQuery = queryOptions({
  queryKey: ['whoami'],
  queryFn: () => fetcher<UserProfileResponse>('/auth/whoami')
})

export const Route = createFileRoute('/(app)/profile/')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const router = useRouter()

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

  if (profileData?.data?.name && profileForm.state.values.name !== profileData.data.name) {
    profileForm.setFieldValue('name', profileData.data.name)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-500'>
          <Spinner className='size-5' />
          <Text>Loading profile...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-3xl'>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Text className='mb-6'>Update your account information below</Text>

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

          <form
            className='space-y-6'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              profileForm.handleSubmit()
            }}
          >
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
              children={(field) => (
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
            />

            <Field>
              <FieldLabel htmlFor='email'>Email Address</FieldLabel>
              <Input
                id='email'
                type='email'
                autoComplete='email'
                value={profileData?.data?.email || ''}
                disabled
                placeholder='john@example.com'
              />
              <Text className='mt-1.5 px-0.5 text-xs text-gray-500'>
                To change your email, go to{' '}
                <button
                  type='button'
                  onClick={() => router.navigate({ to: '/profile/change-email' })}
                  className='font-medium text-blue-600 hover:cursor-pointer hover:text-blue-700'
                >
                  Change Email
                </button>{' '}
                tab.
              </Text>
            </Field>

            <Field>
              <FieldLabel htmlFor='userId'>User ID</FieldLabel>
              <Input id='userId' type='text' value={profileData?.data?.user_id || ''} disabled />
            </Field>

            <profileForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <div className='flex justify-end gap-3'>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={() => router.navigate({ to: '/' })}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={!canSubmit || isSubmitting || updateProfileMutation.isPending}
                  >
                    {isSubmitting || updateProfileMutation.isPending ? (
                      <span className='flex items-center gap-2'>
                        <Spinner className='size-4' />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              )}
            />
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
