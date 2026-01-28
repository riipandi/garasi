import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Field, FieldLabel } from '~/app/components/field'
import { Input } from '~/app/components/input'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'

const changeEmailSchema = z.object({
  newEmail: z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required')
})

export const Route = createFileRoute('/(app)/profile/change-email')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

  const { data: profileData } = useQuery({
    queryKey: ['whoami'],
    queryFn: () =>
      fetcher<{ success: boolean; data: { user_id: string; email: string; name: string } | null }>(
        '/auth/whoami'
      )
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

  return (
    <div className='mx-auto w-full max-w-3xl'>
      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
        </CardHeader>
        <CardBody>
          <Text className='mb-6'>
            Update your email address for account notifications and login
          </Text>

          <div className='mb-6 rounded-md bg-gray-50 p-4'>
            <Text className='font-medium'>Current Email</Text>
            <Text className='text-sm'>{profileData?.data?.email || 'Loading...'}</Text>
          </div>

          {changeEmailMutation.isSuccess && (
            <Alert variant='success'>
              <div className='space-y-1'>
                <p className='font-medium'>Email change request sent!</p>
                <Text className='text-sm opacity-90'>
                  We've sent a confirmation link to your new email address. Please check your inbox
                  and click the link to complete the email change process.
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

          <form
            className='space-y-6'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              changeEmailForm.handleSubmit()
            }}
          >
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
              children={(field) => (
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
            />

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
                  <FieldLabel htmlFor='password'>
                    Current Password <span className='ml-1 text-red-500'>*</span>
                  </FieldLabel>
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

            <changeEmailForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <div className='flex justify-end gap-3'>
                  <Button type='button' variant='secondary' onClick={() => changeEmailForm.reset()}>
                    Cancel
                  </Button>
                  <Button
                    type='submit'
                    variant='primary'
                    disabled={!canSubmit || isSubmitting || changeEmailMutation.isPending}
                  >
                    {isSubmitting || changeEmailMutation.isPending ? (
                      <span className='flex items-center gap-2'>
                        <Spinner className='size-4' />
                        Sending...
                      </span>
                    ) : (
                      'Send Confirmation'
                    )}
                  </Button>
                </div>
              )}
            </changeEmailForm.Subscribe>
          </form>

          <div className='mt-6 rounded-md border border-blue-200 bg-blue-50 p-4'>
            <div className='flex gap-3'>
              <div className='mt-0.5 size-5 shrink-0 text-blue-600'>ℹ</div>
              <div>
                <Text className='font-medium text-blue-900'>Email change process</Text>
                <Text className='mt-1 text-xs text-blue-700'>
                  After submitting, we'll send a confirmation link to your new email address. You'll
                  need to click the link to complete the email change. Your current email will
                  remain active until the change is confirmed.
                </Text>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
