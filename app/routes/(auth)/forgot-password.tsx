import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Field, FieldError, FieldLabel } from '~/app/components/field'
import { Heading } from '~/app/components/heading'
import { Input } from '~/app/components/input'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'

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
        }
      } catch (error: any) {
        throw new Error(error?.data?.message || error?.message || 'Failed to send reset email')
      }
    }
  })

  return (
    <Stack spacing='lg' className='w-full max-w-md p-8'>
      <Stack spacing='md'>
        <Heading level={1} size='lg'>
          Forgot your password?
        </Heading>
        <Text>
          Enter your email address and we'll send you a link to reset your password
        </Text>
      </Stack>

      <Stack>
        {isSuccess ? (
          <Stack>
            <Alert variant='success'>
              <div className='flex items-start gap-3'>
                <svg className='mt-0.5 size-5 shrink-0' fill='currentColor' viewBox='0 0 20 20' aria-hidden='true'>
                  <title>Success icon</title>
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

            <Stack>
              <Button
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
              <Button
                variant='outline'
                block
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsSuccess(false)
                  setSuccessMessage('')
                  Form.reset()
                  emailInputRef.current?.focus()
                }}
              >
                Try another email
              </Button>
            </Stack>
          </Stack>
        ) : (
          <>
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
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='email'>Email address</FieldLabel>
                  <Input
                    ref={emailInputRef}
                    id='email'
                    name={field.name}
                    type='email'
                    autoComplete='email'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='you@example.com'
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
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
