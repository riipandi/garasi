import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { Field, FieldLabel, FieldError } from '~/app/components/field'
import { Fieldset, FieldsetLegend } from '~/app/components/fieldset'
import { Form } from '~/app/components/form'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import { Spinner } from '~/app/components/spinner'
import type {
  GetKeyInformationResponse,
  UpdateAccessKeyRequest
} from '~/shared/schemas/keys.schema'

// Extend the schema type with additional properties needed by the UI
interface AccessKey extends GetKeyInformationResponse {
  deleted?: boolean
  neverExpires?: boolean
  secretKeyId?: string
}

interface KeyEditProps {
  isOpen: boolean
  accessKey: AccessKey
  onClose: () => void
  onSubmit: (values: UpdateAccessKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

const updateKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Name must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Name cannot contain spaces'),
  neverExpires: z.boolean().default(false),
  expiration: z.string().nullable().optional(),
  allowCreateBucket: z.boolean().default(false)
})

export function KeyEdit({ isOpen, accessKey, onClose, onSubmit, isSubmitting }: KeyEditProps) {
  const form = useForm({
    defaultValues: {
      name: accessKey.name || '',
      neverExpires: accessKey.neverExpires || false,
      expiration: accessKey.expiration || '',
      allowCreateBucket: accessKey.permissions?.createBucket ?? false
    },
    onSubmit: async ({ value }) => {
      const result = updateKeySchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }

      const submitValue: UpdateAccessKeyRequest = {
        name: value.name,
        neverExpires: value.neverExpires,
        expiration: value.neverExpires ? null : value.expiration || null,
        allow: value.allowCreateBucket ? { createBucket: true } : null,
        deny: value.allowCreateBucket ? null : { createBucket: true }
      }

      await onSubmit(submitValue)
    }
  })

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        name: accessKey.name || '',
        neverExpires: accessKey.neverExpires || false,
        expiration: accessKey.expiration || '',
        allowCreateBucket: accessKey.permissions?.createBucket ?? false
      })
    }
  }, [isOpen, accessKey, form])

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Form onSubmit={handleSubmit}>
        <DialogPopup>
          <DialogHeader>
            <IconBox variant='primary' size='sm'>
              <Lucide.KeyRound className='size-4' />
            </IconBox>
            <DialogTitle>Edit Access Key</DialogTitle>

            <DialogClose className='ml-auto'>
              <Lucide.X className='size-4' strokeWidth={2.0} />
            </DialogClose>
          </DialogHeader>
          <DialogBody>
            <DialogDescription>Update the access key details</DialogDescription>

            <form.Field
              name='name'
              validators={{
                onChange: ({ value }) => {
                  const result = updateKeySchema.shape.name.safeParse(value)
                  if (!result.success) {
                    const firstError = result.error.issues[0]
                    return firstError ? firstError.message : undefined
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <Field className='mt-4'>
                  <FieldLabel htmlFor='name'>Name</FieldLabel>
                  <Input
                    id='name'
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                    placeholder='e.g., production-api-key'
                    disabled={isSubmitting}
                  />
                  <FieldError match={!field.state.meta.isValid}>
                    {field.state.meta.errors.join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => state.values.neverExpires}>
              {(neverExpires) => (
                <form.Field
                  name='expiration'
                  validators={{
                    onChange: ({ value }) => {
                      if (!neverExpires) {
                        if (!value || value.trim() === '') {
                          return 'Expiration Date is required'
                        }
                      }
                      return undefined
                    }
                  }}
                >
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor='expiration'>Expiration Date</FieldLabel>
                      <Input
                        id='expiration'
                        type='datetime-local'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting || neverExpires}
                      />
                      <FieldError match={!field.state.meta.isValid}>
                        {field.state.meta.errors.join(', ')}
                      </FieldError>
                    </Field>
                  )}
                </form.Field>
              )}
            </form.Subscribe>

            <form.Field name='neverExpires'>
              {(field) => (
                <Field>
                  <Label>
                    <Checkbox name={field.name} />
                    <span>Never expires</span>
                  </Label>
                </Field>
              )}
            </form.Field>

            <Fieldset>
              <FieldsetLegend>Permissions</FieldsetLegend>
              <form.Field name='allowCreateBucket'>
                {(field) => (
                  <Field>
                    <Label>
                      <Checkbox name={field.name} />
                      <span>Allow creating buckets</span>
                    </Label>
                  </Field>
                )}
              </form.Field>
            </Fieldset>
          </DialogBody>
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmittingForm]) => (
                <DialogClose
                  render={
                    <Button
                      type='submit'
                      size='sm'
                      disabled={!canSubmit || isSubmittingForm || isSubmitting}
                    >
                      {isSubmitting || isSubmittingForm ? (
                        <span className='flex items-center gap-2'>
                          <Spinner className='size-4' strokeWidth={2.0} />
                          Updating...
                        </span>
                      ) : (
                        'Update Key'
                      )}
                    </Button>
                  }
                />
              )}
            </form.Subscribe>
          </DialogFooter>
        </DialogPopup>
      </Form>
    </Dialog>
  )
}
