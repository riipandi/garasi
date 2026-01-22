import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { cn as clx } from 'tailwind-variants'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { PasswordInput } from '~/app/components/password-input'
import { useAuth } from '~/app/guards'
import type { SigninRequest } from '~/app/types/api'

// Zod schema for form validation
const signinSchema = z.object({
  email: z.email({ error: 'Please enter a valid email address' }),
  password: z.string().min(1, { error: 'Password is required' }),
  remember: z.boolean().optional()
})

export const Route = createFileRoute('/(auth)/signin')({
  component: RouteComponent
})

function RouteComponent() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const search = useSearch({ from: '/(auth)/signin' }) as {
    message?: string
    type?: 'success' | 'error'
  }
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Auto-focus email input on mount
  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

  const Form = useForm({
    defaultValues: { email: '', password: '', remember: false } satisfies SigninRequest,
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      // Validate with Zod before submitting
      const result = signinSchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          setSubmitError(firstError.message)
        } else {
          setSubmitError('Please check your input and try again')
        }
        return
      }

      const loginResult = await login(value.email, value.password)

      if (loginResult.success) {
        navigate({ to: '/' })
      } else {
        setSubmitError(loginResult.error || 'Invalid email or password. Please try again.')
      }
    }
  })

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md space-y-8 p-8'>
        <div className='text-center'>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>Sign in to your account</h2>
          <p className='mt-2 text-sm text-gray-600'>
            Enter your credentials to access your account
          </p>
        </div>

        <div className='rounded-lg bg-white p-6 shadow-md'>
          <form
            className='space-y-6'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              Form.handleSubmit()
            }}
          >
            {search.message && <Alert type={search.type || 'success'}>{search.message}</Alert>}

            {submitError && <Alert type='error'>{submitError}</Alert>}

            <Form.Field
              name='email'
              validators={{
                onChange: ({ value }) => {
                  const result = signinSchema.shape.email.safeParse(value)
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
                    placeholder='somebody@example.com'
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className='mt-1 text-sm text-red-600'>
                      {String(field.state.meta.errors[0])}
                    </p>
                  )}
                </div>
              )}
            />

            <Form.Field
              name='password'
              validators={{
                onChange: ({ value }) => {
                  const result = signinSchema.shape.password.safeParse(value)
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
                  placeholder='****************'
                  autoComplete='current-password'
                  error={
                    field.state.meta.errors[0] ? String(field.state.meta.errors[0]) : undefined
                  }
                  label='Password'
                />
              )}
            />

            <Form.Field
              name='remember'
              children={(field) => (
                <div className='flex items-center'>
                  <input
                    id='remember'
                    name={field.name}
                    type='checkbox'
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked as any)}
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label htmlFor='remember' className='ml-2 block text-sm text-gray-700'>
                    Remember me
                  </label>
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
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              )}
            />

            <div className='flex w-full items-center justify-center text-center text-sm'>
              <Link
                to='/forgot-password'
                className='font-medium text-gray-700 transition-colors hover:text-gray-900'
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
