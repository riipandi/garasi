import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { PasswordInput } from '~/app/components/password-input'
import { fetcher } from '~/app/fetcher'

// Zod schema for form validation
const changeEmailSchema = z.object({
  newEmail: z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required')
})

export const Route = createFileRoute('/(app)/profile/change-email')({
  component: RouteComponent
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()

  // Fetch user profile to get current email
  const { data: profileData } = useQuery({
    queryKey: ['whoami'],
    queryFn: () =>
      fetcher<{ success: boolean; data: { user_id: string; email: string; name: string } | null }>(
        '/auth/whoami'
      )
  })

  // Change email mutation
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
      // Invalidate whoami query to refresh data
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const Form = useForm({
    defaultValues: { newEmail: '', password: '' },
    onSubmit: async ({ value }) => {
      // Validate with Zod before submitting
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
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Change Email</h2>
          <p className='text-normal mt-2 text-gray-500'>
            Update your email address for account notifications and login
          </p>
        </div>

        {/* Current Email Display */}
        <div className='mb-6 rounded-md bg-gray-50 p-4'>
          <label className='mb-1 block text-sm font-medium text-gray-700'>Current Email</label>
          <p className='text-sm font-medium text-gray-900'>
            {profileData?.data?.email || 'Loading...'}
          </p>
        </div>

        {changeEmailMutation.isSuccess && (
          <div className='mb-4'>
            <Alert type='success'>
              <div className='space-y-1'>
                <p className='font-medium'>Email change request sent!</p>
                <p className='text-sm opacity-90'>
                  We've sent a confirmation link to your new email address. Please check your inbox
                  and click the link to complete the email change process.
                </p>
              </div>
            </Alert>
          </div>
        )}

        {changeEmailMutation.error && (
          <div className='mb-4'>
            <Alert type='error'>
              {changeEmailMutation.error instanceof Error
                ? changeEmailMutation.error.message
                : 'Failed to request email change. Please try again.'}
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
              <div>
                <label htmlFor='newEmail' className='mb-1 block text-sm font-medium text-gray-700'>
                  New Email Address
                </label>
                <input
                  id='newEmail'
                  name={field.name}
                  type='email'
                  autoComplete='email'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500'
                  placeholder='new.email@example.com'
                  disabled={changeEmailMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          <Form.Field
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
            children={(field) => (
              <PasswordInput
                id='password'
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(value) => field.handleChange(value)}
                placeholder='••••••••'
                autoComplete='current-password'
                error={field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined}
                label='Current Password'
                required
                disabled={changeEmailMutation.isPending}
              />
            )}
          />

          <Form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
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
                  disabled={!canSubmit || isSubmitting || changeEmailMutation.isPending}
                  className='rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting || changeEmailMutation.isPending ? (
                    <span className='flex items-center gap-2'>
                      <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
                      Sending...
                    </span>
                  ) : (
                    'Send Confirmation'
                  )}
                </button>
              </div>
            )}
          />
        </form>

        <div className='mt-6 rounded-md border border-blue-200 bg-blue-50 p-4'>
          <div className='flex gap-3'>
            <svg
              className='mt-0.5 size-5 shrink-0 text-blue-600'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                clipRule='evenodd'
              />
            </svg>
            <div>
              <h4 className='text-sm font-medium text-blue-900'>Email change process</h4>
              <p className='mt-1 text-xs text-blue-700'>
                After submitting, we'll send a confirmation link to your new email address. You'll
                need to click the link to complete the email change. Your current email will remain
                active until the change is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
