import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import { Field, FieldError, FieldLabel } from '~/app/components/field'
import { Heading } from '~/app/components/heading'
import { Input } from '~/app/components/input'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import { useAuth } from '~/app/guards'
import type { SigninRequest } from '~/app/types/api'

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
  const { login, isAuthenticated, sessionExpired } = useAuth()
  const search = useSearch({ from: '/(auth)/signin' }) as {
    message?: string
    type?: 'success' | 'error'
    redirect?: string
  }
  const emailInputRef = useRef<HTMLInputElement>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const Form = useForm({
    defaultValues: { email: '', password: '', remember: false } satisfies SigninRequest,
    onSubmit: async ({ value }) => {
      setSubmitError(null)

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
        navigate({ to: search.redirect || '/' })
      } else {
        setSubmitError(loginResult.error || 'Invalid email or password. Please try again.')
      }
    }
  })

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (sessionExpired && search.redirect) {
      setSubmitError('Your session has expired. Please sign in again to continue.')
    }
  }, [sessionExpired, search.redirect])

  if (isAuthenticated) {
    navigate({ to: '/' })
    return null
  }

  return (
    <Stack spacing='lg' className='w-full max-w-md p-8'>
      <Stack spacing='md'>
        <Heading level={1} size='lg'>
          Sign in to your account
        </Heading>
        <Text>Enter your credentials to access your account</Text>
      </Stack>

      <Stack>
        {search.message && (
          <Alert variant={search.type === 'success' ? 'success' : 'danger'}>{search.message}</Alert>
        )}

        {submitError && <Alert variant='danger'>{submitError}</Alert>}

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
                placeholder='somebody@example.com'
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{String(field.state.meta.errors[0])}</FieldError>
              )}
            </Field>
          )}
        </Form.Field>

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
        >
          {(field) => (
            <Field>
              <FieldLabel htmlFor='password'>Password</FieldLabel>
              <Input
                id='password'
                name={field.name}
                type='password'
                autoComplete='current-password'
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder='••••••'
              />
              {field.state.meta.errors.length > 0 && (
                <FieldError>{String(field.state.meta.errors[0])}</FieldError>
              )}
            </Field>
          )}
        </Form.Field>

        <Form.Field name='remember' validators={{}}>
          {(field) => (
            <label htmlFor='remember' className='flex cursor-pointer items-center gap-2 text-sm'>
              <Checkbox
                id='remember'
                name={field.name}
                checked={field.state.value}
                onCheckedChange={(checked) => field.handleChange(checked as any)}
              />
              <span>Remember me</span>
            </label>
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
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          )}
        </Form.Subscribe>

        <Text className='text-center'>
          <Link
            to='/forgot-password'
            className='text-primary hover:text-primary/80 transition-colors'
          >
            Forgot your password?
          </Link>
        </Text>
      </Stack>
    </Stack>
  )
}
