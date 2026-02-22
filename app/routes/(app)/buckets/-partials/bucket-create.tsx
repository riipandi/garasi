import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/app/components/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { Field, FieldError, FieldLabel } from '~/app/components/field'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Spinner } from '~/app/components/spinner'
import type { CreateBucketRequest } from '~/shared/schemas/bucket.schema'

interface BucketCreateProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateBucketRequest) => Promise<void>
  isSubmitting?: boolean
}

const createBucketSchema = z.object({
  globalAlias: z
    .string()
    .min(1, 'Bucket name is required')
    .max(100, 'Bucket name must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Bucket name must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Bucket name cannot contain spaces')
})

export function BucketCreate({ isOpen, onClose, onSubmit, isSubmitting }: BucketCreateProps) {
  const form = useForm({
    defaultValues: {
      globalAlias: ''
    },
    validators: {
      onChange: ({ value }) => {
        const result = createBucketSchema.safeParse(value)
        if (!result.success) {
          const firstError = result.error.issues[0]
          if (firstError) {
            const path = firstError.path[0] as string
            return { [path]: firstError.message }
          }
        }
        return undefined
      }
    },
    onSubmit: async ({ value }) => {
      const createValues: CreateBucketRequest = {
        globalAlias: value.globalAlias,
        localAlias: null
      }

      await onSubmit(createValues)
    }
  })

  React.useEffect(() => {
    if (isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  const canSubmit = form.state.canSubmit && !isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup className='w-sm'>
        <DialogHeader>
          <IconBox variant='primary' size='sm'>
            <Lucide.Box className='size-4' />
          </IconBox>
          <DialogTitle>Create Bucket</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='border-border mt-3 border-t pt-3'>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <form.Field name='globalAlias'>
              {(field) => (
                <Field>
                  <FieldLabel htmlFor='globalAlias'>Bucket Name</FieldLabel>
                  <Input
                    id='globalAlias'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='my-bucket'
                    disabled={isSubmitting}
                  />
                  <FieldError match={!field.state.meta.isValid}>
                    {field.state.meta.errors.join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.Field>
          </form>
        </DialogBody>

        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <Button type='button' disabled={!canSubmit} onClick={() => form.handleSubmit()} block>
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <Spinner className='size-4' strokeWidth={2.0} />
                Creating...
              </span>
            ) : (
              'Create Bucket'
            )}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
