import { z } from 'zod'
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
import { Text } from '~/app/components/typography'
import type { UserProfileResponse } from '~/app/types/api'

interface ProfileInfoCardProps {
  profileForm: any
  updateProfileMutation: any
  profileData?: UserProfileResponse
}

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters')
})

export function ProfileInfoCard({ profileForm, updateProfileMutation }: ProfileInfoCardProps) {
  return (
    <Card id='profile-info'>
      <form
        className='space-y-6'
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          profileForm.handleSubmit()
        }}
      >
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your account information below</CardDescription>
        </CardHeader>
        <CardBody className='pt-2'>
          <profileForm.Field
            name='name'
            validators={{
              onChange: ({ value }: { value: string }) => {
                const result = profileSchema.shape.name.safeParse(value)
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
                <FieldLabel htmlFor='name'>Full Name</FieldLabel>
                <Input
                  id='name'
                  name={field.name}
                  type='text'
                  autoComplete='name'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='John Doe'
                  disabled={updateProfileMutation.isPending}
                />
                {field.state.meta.errors.length > 0 && (
                  <Text className='mt-1 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </Text>
                )}
              </Field>
            )}
          </profileForm.Field>
        </CardBody>
        <CardFooter className='flex justify-end gap-3'>
          <Button type='button' variant='secondary' onClick={() => profileForm.reset()}>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='primary'
            disabled={
              !profileForm.state.canSubmit ||
              profileForm.state.isSubmitting ||
              updateProfileMutation.isPending
            }
          >
            {profileForm.state.isSubmitting || updateProfileMutation.isPending ? (
              <span className='flex items-center gap-2'>
                <Spinner className='size-4' />
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
