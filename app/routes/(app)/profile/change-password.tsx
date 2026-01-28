import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
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

export const Route = createFileRoute('/(app)/profile/change-password')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

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

  return (
    <div className='mx-auto w-full max-w-3xl'>
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardBody>
          <Text className='mb-6'>
            Ensure your account is using a long, random password to stay secure
          </Text>

          {changePasswordMutation.isSuccess && (
            <Alert variant='success'>Password changed successfully!</Alert>
          )}

          {changePasswordMutation.error && (
            <Alert variant='danger'>
              {changePasswordMutation.error instanceof Error
                ? changePasswordMutation.error.message
                : 'Failed to change password. Please try again.'}
            </Alert>
          )}

          <form
            className='space-y-6'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              changePasswordForm.handleSubmit()
            }}
          >
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
                  <FieldLabel htmlFor='currentPassword'>
                    Current Password <span className='ml-1 text-red-500'>*</span>
                  </FieldLabel>
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
                  <FieldLabel htmlFor='newPassword'>
                    New Password <span className='ml-1 text-red-500'>*</span>
                  </FieldLabel>
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
                  <FieldLabel htmlFor='confirmPassword'>
                    Confirm New Password <span className='ml-1 text-red-500'>*</span>
                  </FieldLabel>
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

            <changePasswordForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <div className='flex justify-end gap-3'>
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
                    disabled={!canSubmit || isSubmitting || changePasswordMutation.isPending}
                  >
                    {isSubmitting || changePasswordMutation.isPending ? (
                      <span className='flex items-center gap-2'>
                        <Spinner className='size-4' />
                        Changing...
                      </span>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </div>
              )}
            </changePasswordForm.Subscribe>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
