import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/ui/Alert'
import { PasswordInput } from '~/app/components/ui/PasswordInput'
import { fetcher } from '~/app/fetcher'

interface ResetPasswordLoaderData {
  isValidToken: boolean
}

export const Route = createFileRoute('/(auth)/reset-password/$token')({
  component: RouteComponent,
  beforeLoad: async ({ params }) => {
    const { token } = params

    // Check if token is empty
    if (!token || token.trim() === '') {
      return { isValidToken: false }
    }

    try {
      // Validate token by calling the validation endpoint
      const response = await fetcher<{
        success: boolean
        message: string
        data: {
          is_token_valid: boolean
        }
      }>('/auth/validate-token?token=' + token, {
        method: 'GET'
      })

      // Check if token is valid from the response
      return { isValidToken: response.success && response.data?.is_token_valid }
    } catch (error) {
      console.error(error)
      // If we get an error, the token is invalid/expired
      return { isValidToken: false }
    }
  }
})

// Zod schema for form validation
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

function RouteComponent() {
  const { token } = Route.useParams()
  const loaderData = Route.useLoaderData() as ResetPasswordLoaderData
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const passwordInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus password input on mount
  useEffect(() => {
    if (loaderData?.isValidToken) {
      passwordInputRef.current?.focus()
    }
  }, [loaderData])

  const Form = useForm({
    defaultValues: { password: '', confirmPassword: '' },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetcher<{
          success: boolean
          message: string
          data: null
        }>(`/auth/reset-password?token=${token}`, {
          method: 'POST',
          body: { password: value.password }
        })

        if (response.success) {
          setIsSuccess(true)
          setSuccessMessage(response.message)
        }
      } catch (error: any) {
        throw new Error(error?.data?.message || error?.message || 'Failed to reset password')
      }
    }
  })

  // Check if token is invalid
  const isInvalidToken = !loaderData?.isValidToken

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-8 p-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Reset your password</h2>
          <p className='mt-2 text-sm text-gray-600'>
            {isInvalidToken ? 'Invalid or expired reset token' : 'Enter your new password below'}
          </p>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          {isInvalidToken ? (
            // Show error for invalid token
            <div className='space-y-6'>
              <Alert type='error'>
                <div className='flex items-start gap-3'>
                  <svg className='mt-0.5 h-5 w-5 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div>
                    <p className='font-medium'>Invalid or expired link</p>
                    <p className='mt-1 text-sm opacity-90'>
                      This password reset link is invalid or has expired. Please request a new one.
                    </p>
                  </div>
                </div>
              </Alert>
              <div className='space-y-3'>
                <Link
                  to='/forgot-password'
                  className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
                >
                  Request New Reset Link
                </Link>
                <Link
                  to='/signin'
                  className='flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
                >
                  Back to Sign in
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            // Success state
            <div className='space-y-6'>
              <Alert type='success'>
                <div className='flex items-start gap-3'>
                  <svg className='mt-0.5 h-5 w-5 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div>
                    <p className='font-medium'>Password reset successful</p>
                    <p className='mt-1 text-sm opacity-90'>{successMessage}</p>
                  </div>
                </div>
              </Alert>

              <Link
                to='/signin'
                className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none'
              >
                Sign in with your new password
              </Link>
            </div>
          ) : (
            // Show reset form
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                Form.handleSubmit()
              }}
            >
              {Form.state.errors.length > 0 && <Alert type='error'>{Form.state.errors[0]}</Alert>}

              <Form.Field
                name='password'
                validators={{
                  onChange: ({ value }) => {
                    const result = resetPasswordSchema.shape.password.safeParse(value)
                    if (!result.success) {
                      const firstError = result.error.issues[0]
                      return firstError ? firstError.message : undefined
                    }
                    return undefined
                  }
                }}
                children={(field) => (
                  <div>
                    <PasswordInput
                      ref={passwordInputRef}
                      id='password'
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(value) => field.handleChange(value)}
                      placeholder='•••••••'
                      autoComplete='new-password'
                      error={
                        field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined
                      }
                      label='New Password'
                      required
                    />
                  </div>
                )}
              />

              <Form.Field
                name='confirmPassword'
                validators={{
                  onChange: ({ value }) => {
                    const result = resetPasswordSchema.shape.confirmPassword.safeParse(value)
                    if (!result.success) {
                      const firstError = result.error.issues[0]
                      return firstError ? firstError.message : undefined
                    }
                    return undefined
                  }
                }}
                children={(field) => (
                  <PasswordInput
                    id='confirmPassword'
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    placeholder='•••••••'
                    autoComplete='new-password'
                    error={
                      field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined
                    }
                    label='Confirm New Password'
                    required
                  />
                )}
              />

              <Form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <div>
                    <button
                      type='submit'
                      disabled={!canSubmit || isSubmitting}
                      className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {isSubmitting ? (
                        <span className='flex items-center gap-2'>
                          <svg className='h-4 w-4 animate-spin' fill='none' viewBox='0 0 24 24'>
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
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.2 3 7.938l3-2.647z'
                            />
                          </svg>
                          Resetting...
                        </span>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                )}
              />

              <div className='text-center'>
                <Link
                  to='/signin'
                  className='text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500'
                >
                  Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
