import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Checkbox } from '~/app/components/checkbox'
import { Dialog, DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogTitle } from '~/app/components/dialog'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import type { CreateAccessKeyRequest } from '~/shared/schemas/keys.schema'

interface KeyCreateProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateAccessKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

const createKeySchema = z.object({
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

export function KeyCreate({ isOpen, onClose, onSubmit, isSubmitting }: KeyCreateProps) {
  const Form = useForm({
    defaultValues: {
      name: '',
      neverExpires: false,
      expiration: '',
      allowCreateBucket: false
    },
    onSubmit: async ({ value }) => {
      const result = createKeySchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }

      const submitValue = {
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
      Form.reset()
    }
  }, [isOpen, Form])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <IconBox variant='primary' size='sm'>
              <Lucide.KeyRound className='size-4' />
            </IconBox>
            <DialogTitle>Create New Access Key</DialogTitle>
          </div>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            Create a new access key to authenticate with Garage S3 API
          </DialogDescription>
          <Stack direction='column' spacing='md' className='mt-4'>
            <Form.Field
              name='name'
              validators={{
                onChange: ({ value }) => {
                  const result = createKeySchema.shape.name.safeParse(value)
                  if (!result.success) {
                    const firstError = result.error.issues[0]
                    return firstError ? firstError.message : undefined
                  }
                  return undefined
                }
              }}
              children={(field) => (
                <div>
                  <Label htmlFor='name'>
                    Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                    }
                    placeholder='e.g., production-api-key'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            />
            <Form.Subscribe
              selector={(state) => state.values.neverExpires}
              children={(neverExpires) => (
                <Form.Field
                  name='expiration'
                  validators={{
                    onChange: ({ value }) => {
                      if (!neverExpires) {
                        if (!value || value.trim() === '') {
                          return 'Expiration Date is required when "Never expires" is unchecked'
                        }
                      }
                      return undefined
                    }
                  }}
                  children={(field) => (
                    <div>
                      <Label htmlFor='expiration'>
                        Expiration Date{!neverExpires && <span className='text-red-500'> *</span>}
                      </Label>
                      <Input
                        id='expiration'
                        name={field.name}
                        type='datetime-local'
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isSubmitting || neverExpires}
                      />
                      {field.state.meta.errors[0] && (
                        <p className='mt-1 text-xs text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                />
              )}
            />
            <Form.Field
              name='neverExpires'
              children={(field) => (
                <div className='flex items-center gap-2'>
                  <Checkbox
                    id='neverExpires'
                    name={field.name}
                    checked={field.state.value}
                    onCheckedChange={(checked) => field.handleChange(checked === true)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor='neverExpires'>Never expires</Label>
                </div>
              )}
            />
            <div className='rounded-md bg-gray-50 p-4'>
              <h3 className='mb-3 text-sm font-medium text-gray-900'>Permissions</h3>
              <div className='space-y-3'>
                <Form.Field
                  name='allowCreateBucket'
                  children={(field) => (
                    <div className='flex items-center gap-2'>
                      <Checkbox
                        id='allowCreateBucket'
                        name={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked === true)}
                        disabled={isSubmitting}
                      />
                      <Label htmlFor='allowCreateBucket'>Allow creating buckets</Label>
                    </div>
                  )}
                />
              </div>
            </div>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmittingForm]) => (
              <Stack direction='row' className='flex justify-end gap-3'>
                <DialogClose>Cancel</DialogClose>
                <DialogClose
                  render={
                    <button
                      type='submit'
                      onClick={() => Form.handleSubmit()}
                      disabled={!canSubmit || isSubmittingForm || isSubmitting}
                      className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      {isSubmitting || isSubmittingForm ? (
                        <>
                          <Spinner />
                          Creating...
                        </>
                      ) : (
                        'Create Access Key'
                      )}
                    </button>
                  }
                />
              </Stack>
            )}
          />
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
