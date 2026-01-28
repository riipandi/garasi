import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Input } from '~/app/components/input'
import fetcher from '~/app/fetcher'

// Zod schema for form validation
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

  // Change password mutation
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
      // Invalidate whoami query to refresh data
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const Form = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      // Validate with Zod before submitting
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
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Change Password</h2>
          <p className='text-normal mt-2 text-gray-500'>
            Ensure your account is using a long, random password to stay secure
          </p>
        </div>

        {changePasswordMutation.isSuccess && (
          <div className='mb-4'>
            <Alert variant='success'>Password changed successfully!</Alert>
          </div>
        )}

        {changePasswordMutation.error && (
          <div className='mb-4'>
            <Alert variant='danger'>
              {changePasswordMutation.error instanceof Error
                ? changePasswordMutation.error.message
                : 'Failed to change password. Please try again.'}
            </Alert>
          </div>
        )}

        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            Form.handleSubmit()
          }}
        >
          <Form.Field
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
              <div>
                <label
                  htmlFor='currentPassword'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Current Password <span className='ml-1 text-red-500'>*</span>
                </label>
                <Input
                  id='currentPassword'
                  name={field.name}
                  type='password'
                  autoComplete='current-password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='•••••••'
                  disabled={changePasswordMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </Form.Field>

          <Form.Field
            name='newPassword'
            validators={{
              onChange: ({ value }) => {
                const result = changePasswordSchema.shape.newPassword.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }
                return undefined
              },
              onChangeAsync: async ({ value, fieldApi }) => {
                // If confirmPassword has a value, re-validate it when password changes
                const confirmPasswordValue = fieldApi.form.getFieldValue('confirmPassword')
                if (confirmPasswordValue && confirmPasswordValue !== value) {
                  // Trigger re-validation of confirmPassword field
                  fieldApi.form.setFieldValue('confirmPassword', confirmPasswordValue)
                }
              }
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor='newPassword'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  New Password <span className='ml-1 text-red-500'>*</span>
                </label>
                <Input
                  id='newPassword'
                  name={field.name}
                  type='password'
                  autoComplete='new-password'
                  strengthIndicator
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='•••••••'
                  disabled={changePasswordMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </Form.Field>

          <Form.Field
            name='confirmPassword'
            validators={{
              onChange: ({ value, fieldApi }) => {
                // Check if confirmPassword is not empty
                if (!value || value.trim() === '') {
                  return 'Please confirm your new password'
                }

                // Get the password field value
                const passwordValue = fieldApi.form.getFieldValue('newPassword')

                // Check if passwords match
                if (value !== passwordValue) {
                  return 'Passwords do not match'
                }

                return undefined
              }
            }}
          >
            {(field) => (
              <div>
                <label
                  htmlFor='confirmPassword'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Confirm New Password <span className='ml-1 text-red-500'>*</span>
                </label>
                <Input
                  id='confirmPassword'
                  name={field.name}
                  type='password'
                  autoComplete='new-password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='•••••••'
                  disabled={changePasswordMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          </Form.Field>

          <Form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => Form.reset()}
                  className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={!canSubmit || isSubmitting || changePasswordMutation.isPending}
                  className='rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting || changePasswordMutation.isPending ? (
                    <span className='flex items-center gap-2'>
                      <svg
                        className='size-4 animate-spin'
                        fill='none'
                        viewBox='0 0 24 24'
                        aria-hidden='true'
                      >
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
                      Changing...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            )}
          </Form.Subscribe>
        </form>
      </div>
    </div>
  )
}
