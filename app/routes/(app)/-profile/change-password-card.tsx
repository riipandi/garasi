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
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/text'

interface ChangePasswordCardProps {
  changePasswordForm: any
  changePasswordMutation: any
}

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

export function ChangePasswordCard({
  changePasswordForm,
  changePasswordMutation
}: ChangePasswordCardProps) {
  return (
    <Card id='change-password'>
      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          changePasswordForm.handleSubmit()
        }}
      >
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Ensure your account is using a long, random password to stay secure
          </CardDescription>
        </CardHeader>
        <CardBody className='space-y-6 pt-2'>
          {changePasswordMutation.isSuccess && (
            <Alert variant='success'>
              Password changed successfully! All sessions have been terminated for security.
            </Alert>
          )}

          {changePasswordMutation.error && (
            <Alert variant='danger'>
              {changePasswordMutation.error instanceof Error
                ? changePasswordMutation.error.message
                : 'Failed to change password. Please try again.'}
            </Alert>
          )}

          <changePasswordForm.Field
            name='currentPassword'
            validators={{
              onChange: ({ value }: { value: string }) => {
                const result = changePasswordSchema.shape.currentPassword.safeParse(value)
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
                <FieldLabel htmlFor='currentPassword'>Current Password</FieldLabel>
                <Input
                  id='currentPassword'
                  name={field.name}
                  type='password'
                  autoComplete='current-password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='••••••••'
                  disabled={changePasswordMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className='mt-1 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </Text>
                )}
              </Field>
            )}
          </changePasswordForm.Field>

          <changePasswordForm.Field
            name='newPassword'
            validators={{
              onChange: ({ value, fieldApi }: { value: string; fieldApi: any }) => {
                const result = changePasswordSchema.shape.newPassword.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }

                const confirmPasswordValue = fieldApi.form.getFieldValue('confirmPassword')
                if (confirmPasswordValue && confirmPasswordValue !== value) {
                  fieldApi.form.setFieldValue('confirmPassword', confirmPasswordValue)
                }

                return undefined
              }
            }}
          >
            {(field: any) => (
              <Field>
                <FieldLabel htmlFor='newPassword'>New Password</FieldLabel>
                <Input
                  id='newPassword'
                  name={field.name}
                  type='password'
                  autoComplete='new-password'
                  strengthIndicator
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='••••••••'
                  disabled={changePasswordMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className='mt-1 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </Text>
                )}
              </Field>
            )}
          </changePasswordForm.Field>

          <changePasswordForm.Field
            name='confirmPassword'
            validators={{
              onChange: ({ value, fieldApi }: { value: string; fieldApi: any }) => {
                if (!value || value.trim() === '') {
                  return 'Please confirm your new password'
                }

                const passwordValue = fieldApi.form.getFieldValue('newPassword')

                if (value !== passwordValue) {
                  return 'Passwords do not match'
                }

                return undefined
              }
            }}
          >
            {(field: any) => (
              <Field>
                <FieldLabel htmlFor='confirmPassword'>Confirm New Password</FieldLabel>
                <Input
                  id='confirmPassword'
                  name={field.name}
                  type='password'
                  autoComplete='new-password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='••••••••'
                  disabled={changePasswordMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className='mt-1 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </Text>
                )}
              </Field>
            )}
          </changePasswordForm.Field>
        </CardBody>
        <CardFooter className='flex justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={() => changePasswordForm.reset()}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            disabled={
              !changePasswordForm.state.canSubmit ||
              changePasswordForm.state.isSubmitting ||
              changePasswordMutation.isPending
            }
          >
            {changePasswordForm.state.isSubmitting || changePasswordMutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Spinner className='size-4' />
                Changing...
              </span>
            ) : (
              'Change Password'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
