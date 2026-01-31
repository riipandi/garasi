import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Field, FieldError, FieldLabel } from '~/app/components/field'
import { InputPassword } from '~/app/components/input-password'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import fetcher from '~/app/fetcher'

interface ResetPasswordLoaderData {
  isValidToken: boolean
}

export const Route = createFileRoute('/(auth)/reset-password/$token')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { token } = params

    if (!token || token.trim() === '') {
      return { isValidToken: false }
    }

    try {
      const response = await fetcher<{
        success: boolean
        message: string
        data: { is_token_valid: boolean }
      }>(`/auth/validate-token?token=${token}`, {
        method: 'GET'
      })

      return { isValidToken: response.success && response.data?.is_token_valid }
    } catch (error) {
      console.error(error)
      return { isValidToken: false }
    }
  }
})

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
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
        }>(`/auth/password/reset?token=${token}`, {
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

  const isInvalidToken = !loaderData?.isValidToken

  return (
    <Stack spacing='lg' className='w-full max-w-md p-8'>
      <Stack spacing='md'>
        <Heading level={1} size='lg'>
          Reset your password
        </Heading>
        <Text>
          {isInvalidToken ? 'Invalid or expired reset token' : 'Enter your new password below'}
        </Text>
      </Stack>

      <Stack>
        {isInvalidToken ? (
          <Stack>
            <Alert variant='danger'>
              <div className='flex items-start gap-3'>
                <svg
                  className='mt-0.5 size-5 shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'
                >
                  <title>Error icon</title>
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
            <Stack>
              <Button
                block
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Link to='/forgot-password' className='text-foreground hover:text-foreground/80'>
                  Request New Reset Link
                </Link>
              </Button>
              <Button
                variant='outline'
                block
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Link to='/signin' className='text-foreground hover:text-foreground/80'>
                  Back to Sign in
                </Link>
              </Button>
            </Stack>
          </Stack>
        ) : isSuccess ? (
          <Stack>
            <Alert variant='success'>
              <div className='flex items-start gap-3'>
                <svg
                  className='mt-0.5 size-5 shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'
                >
                  <title>Success icon</title>
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

            <Button
              block
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <Link to='/signin' className='text-foreground hover:text-foreground/80'>
                Sign in with your new password
              </Link>
            </Button>
          </Stack>
        ) : (
          <>
            {Form.state.errors.length > 0 && <Alert variant='danger'>{Form.state.errors[0]}</Alert>}

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
                },
                onChangeAsync: async ({ value, fieldApi }) => {
                  const confirmPasswordValue = fieldApi.form.getFieldValue('confirmPassword')
                  if (confirmPasswordValue && confirmPasswordValue !== value) {
                    fieldApi.form.setFieldValue('confirmPassword', confirmPasswordValue)
                  }
                }
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='password'>
                    New Password <span className='ml-1 text-red-500'>*</span>
                  </FieldLabel>
                  <InputPassword
                    ref={passwordInputRef}
                    id='password'
                    name={field.name}
                    autoComplete='new-password'
                    strengthIndicator
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='•••••••'
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{String(field.state.meta.errors[0])}</FieldError>
                  )}
                </Field>
              )}
            </Form.Field>

            <Form.Field
              name='confirmPassword'
              validators={{
                onChange: ({ value, fieldApi }) => {
                  if (!value || value.trim() === '') {
                    return 'Please confirm your password'
                  }

                  const passwordValue = fieldApi.form.getFieldValue('password')

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
                  <InputPassword
                    id='confirmPassword'
                    name={field.name}
                    autoComplete='new-password'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='•••••••'
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError>{String(field.state.meta.errors[0])}</FieldError>
                  )}
                </Field>
              )}
            </Form.Field>

            <Form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type='submit'
                  disabled={!canSubmit || isSubmitting}
                  block
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    Form.handleSubmit()
                  }}
                  progress={isSubmitting}
                >
                  {isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              )}
            </Form.Subscribe>

            <Text className='text-center'>
              <Link to='/signin' className='text-primary hover:text-primary/80 transition-colors'>
                Back to Sign in
              </Link>
            </Text>
          </>
        )}
      </Stack>
    </Stack>
  )
}
