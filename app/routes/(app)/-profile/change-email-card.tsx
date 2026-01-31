import { z } from 'zod'
import { Alert } from '~/app/components/alert'
import { Button } from '~/app/components/button'
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '~/app/components/card'
import { Field, FieldLabel } from '~/app/components/field'
import { Input } from '~/app/components/input'
import { InputPassword } from '~/app/components/input-password'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/typography'
import type { UserProfileResponse } from '~/app/types/api'

interface ChangeEmailCardProps {
  changeEmailForm: any
  changeEmailMutation: any
  profileData?: UserProfileResponse
}

const changeEmailSchema = z.object({
  newEmail: z.email({ error: 'Invalid email address' }),
  password: z.string().min(1, 'Password is required')
})

export function ChangeEmailCard({
  changeEmailForm,
  changeEmailMutation,
  profileData
}: ChangeEmailCardProps) {
  return (
    <Card id='change-email'>
      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          changeEmailForm.handleSubmit()
        }}
      >
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>
            Update your email address for account notifications and login
          </CardDescription>
        </CardHeader>
        <CardBody className='space-y-6 pt-2'>
          {changeEmailMutation.isSuccess && (
            <Alert variant='success'>
              <div className='space-y-1'>
                <p className='font-medium'>Email change request sent!</p>
                <Text className='text-sm opacity-90'>
                  We've sent a confirmation link to your new email address.
                </Text>
              </div>
            </Alert>
          )}

          {changeEmailMutation.error && (
            <Alert variant='danger'>
              {changeEmailMutation.error instanceof Error
                ? changeEmailMutation.error.message
                : 'Failed to request email change. Please try again.'}
            </Alert>
          )}

          <Field>
            <FieldLabel htmlFor='currentEmail'>Current Email Address</FieldLabel>
            <Input
              id='currentEmail'
              name='currentEmail'
              type='email'
              autoComplete='email'
              value={profileData?.data?.email || 'Unknown'}
              placeholder={profileData?.data?.email || 'Unknown'}
              className='bg-accent'
              disabled
              readOnly
            />
          </Field>

          <changeEmailForm.Field
            name='newEmail'
            validators={{
              onChange: ({ value }: { value: string }) => {
                const result = changeEmailSchema.shape.newEmail.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }
                return undefined
              }
            }}
          >
            {(field: any) => (
              <Field>
                <FieldLabel htmlFor='newEmail'>New Email Address</FieldLabel>
                <Input
                  id='newEmail'
                  name={field.name}
                  type='email'
                  autoComplete='email'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='new.email@example.com'
                  disabled={changeEmailMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className='mt-1 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </Text>
                )}
              </Field>
            )}
          </changeEmailForm.Field>

          <changeEmailForm.Field
            name='password'
            validators={{
              onChange: ({ value }: { value: string }) => {
                const result = changeEmailSchema.shape.password.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }
                return undefined
              }
            }}
          >
            {(field: any) => (
              <Field>
                <FieldLabel htmlFor='password'>Current Password</FieldLabel>
                <InputPassword
                  id='password'
                  name={field.name}
                  autoComplete='current-password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='••••••••'
                  disabled={changeEmailMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className='mt-1 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </Text>
                )}
              </Field>
            )}
          </changeEmailForm.Field>
        </CardBody>
        <CardFooter className='flex justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={() => changeEmailForm.reset()}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            disabled={
              !changeEmailForm.state.canSubmit ||
              changeEmailForm.state.isSubmitting ||
              changeEmailMutation.isPending
            }
          >
            {changeEmailForm.state.isSubmitting || changeEmailMutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Spinner className='size-4' />
                Sending...
              </span>
            ) : (
              'Send Confirmation'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
