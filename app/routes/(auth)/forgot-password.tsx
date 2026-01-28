import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { cn as clx } from 'tailwind-variants'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import fetcher from '~/app/fetcher'

// Zod schema for form validation
const forgotPasswordSchema = z.object({
  email: z.email({ error: 'Invalid email address' })
})

export const Route = createFileRoute('/(auth)/forgot-password')({
  component: RouteComponent
})

function RouteComponent() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  const Form = useForm({
    defaultValues: { email: '' },
    onSubmit: async ({ value }) => {
      try {
        const response = await fetcher<{
          success: boolean
          message: string
          data: {
            token?: string
            reset_link?: string
            expires_at?: number
          } | null
        }>('/auth/password/forgot', {
          method: 'POST',
          body: { email: value.email }
        })

        if (response.success) {
          setIsSuccess(true)
          setSuccessMessage(response.message)
          // Don't navigate immediately, show success state on the same page
        }
      } catch (error: any) {
        throw new Error(error?.data?.message || error?.message || 'Failed to send reset email')
      }
    }
  })

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-8 p-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Forgot your password?</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          {isSuccess ? (
            // Success state
            <div className='space-y-6'>
              <Alert variant='success'>
                <div className='flex items-start gap-3'>
                  <svg className='mt-0.5 size-5 shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <div>
                    <p className='font-medium'>Check your email</p>
                    <p className='mt-1 text-sm opacity-90'>{successMessage}</p>
                  </div>
                </div>
              </Alert>

              <div className='space-y-3'>
                <Link
                  to='/signin'
                  className='flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                >
                  Back to Sign in
                </Link>
                <button
                  type='button'
                  onClick={() => {
                    setIsSuccess(false)
                    setSuccessMessage('')
                    Form.reset()
                    emailInputRef.current?.focus()
                  }}
                  className='flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                >
                  Try another email
                </button>
              </div>
            </div>
          ) : (
            // Form state
            <form
              className='space-y-6'
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                Form.handleSubmit()
              }}
            >
              {Form.state.errors.length > 0 && (
                <Alert variant='danger'>{Form.state.errors[0]}</Alert>
              )}

              <Form.Field
                name='email'
                validators={{
                  onChange: ({ value }) => {
                    const result = forgotPasswordSchema.shape.email.safeParse(value)
                    if (!result.success) {
                      const firstError = result.error.issues[0]
                      return firstError ? firstError.message : undefined
                    }
                    return undefined
                  }
                }}
                children={(field) => (
                  <div>
                    <label htmlFor='email' className='mb-1 block text-sm font-medium text-gray-700'>
                      Email address
                    </label>
                    <input
                      ref={emailInputRef}
                      id='email'
                      name={field.name}
                      type='email'
                      autoComplete='email'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className={clx(
                        'block w-full rounded-md border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none',
                        field.state.meta.errors.length > 0 ? 'border-red-300' : 'border-gray-300'
                      )}
                      placeholder='you@example.com'
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className='mt-1 text-sm text-red-600'>
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              />

              <Form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <div>
                    <button
                      type='submit'
                      disabled={!canSubmit || isSubmitting}
                      className='flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {isSubmitting ? (
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
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                )}
              />

              <div className='text-center'>
                <Link
                  to='/signin'
                  className='text-sm font-medium text-gray-700 transition-colors hover:text-gray-900'
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
