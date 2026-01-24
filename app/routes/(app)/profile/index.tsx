import { useForm } from '@tanstack/react-form'
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import fetcher from '~/app/fetcher'
import type { UserProfileResponse } from '~/app/types/api'

// Zod schema for form validation
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

  // Fetch user profile data from /auth/whoami endpoint
  const { data: profileData, isLoading, error } = useSuspenseQuery(whoamiQuery)

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: { name: string }) => {
      return fetcher('/user/profile', {
        method: 'PUT',
        body: { name: values.name }
      })
    },
    onSuccess: () => {
      // Invalidate whoami query to refresh data
      queryClient.invalidateQueries({ queryKey: ['whoami'] })
    }
  })

  const Form = useForm({
    defaultValues: { name: profileData?.data?.name || '' },
    onSubmit: async ({ value }) => {
      // Validate with Zod before submitting
      const result = profileSchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          Form.setFieldValue('name', value.name)
          throw new Error(firstError.message)
        }
        return
      }

      await updateProfileMutation.mutateAsync(value)
    }
  })

  // Update form values when profile data loads
  if (profileData?.data?.name && Form.state.values.name !== profileData.data.name) {
    Form.setFieldValue('name', profileData.data.name)
  }

  if (isLoading) {
    return (
      <div className='flex min-h-100 items-center justify-center'>
        <div className='flex items-center gap-2 text-gray-500'>
          <svg className='size-5 animate-spin' fill='none' viewBox='0 0 24 24'>
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
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return <Alert type='error'>Failed to load profile. Please try again later.</Alert>
  }

  return (
    <div className='mx-auto w-full max-w-3xl space-y-6'>
      <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:p-6'>
        <div className='mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Profile Information</h2>
          <p className='text-normal mt-2 text-gray-500'>Update your account information below</p>
        </div>

        {updateProfileMutation.isSuccess && (
          <div className='mb-4'>
            <Alert type='success'>Profile updated successfully!</Alert>
          </div>
        )}

        {updateProfileMutation.error && (
          <div className='mb-4'>
            <Alert type='error'>
              {updateProfileMutation.error instanceof Error
                ? updateProfileMutation.error.message
                : 'Failed to update profile. Please try again.'}
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
              <div>
                <label htmlFor='name' className='mb-1 block text-sm font-medium text-gray-700'>
                  Full Name
                </label>
                <input
                  id='name'
                  name={field.name}
                  type='text'
                  autoComplete='name'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className='block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500'
                  placeholder='John Doe'
                  disabled={updateProfileMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          {/* Display read-only email */}
          <div>
            <label htmlFor='email' className='mb-1 block text-sm font-medium text-gray-700'>
              Email Address
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              value={profileData?.data?.email || ''}
              disabled
              className='block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
              placeholder='john@example.com'
            />
            <p className='mt-1.5 px-0.5 text-xs text-gray-500'>
              To change your email, go to{' '}
              <button
                type='button'
                onClick={() => router.navigate({ to: '/profile/change-email' })}
                className='font-medium text-blue-600 hover:cursor-pointer hover:text-blue-700'
              >
                Change Email
              </button>{' '}
              tab.
            </p>
          </div>

          {/* Display read-only user ID */}
          <div>
            <label htmlFor='userId' className='mb-1 block text-sm font-medium text-gray-700'>
              User ID
            </label>
            <input
              id='userId'
              type='text'
              value={profileData?.data?.user_id || ''}
              disabled
              className='block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
            />
          </div>

          <Form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={() => router.navigate({ to: '/' })}
                  className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={!canSubmit || isSubmitting || updateProfileMutation.isPending}
                  className='rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                >
                  {isSubmitting || updateProfileMutation.isPending ? (
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
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            )}
          />
        </form>
      </div>
    </div>
  )
}
