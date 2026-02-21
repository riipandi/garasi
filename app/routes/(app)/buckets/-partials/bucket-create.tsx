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
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { Field, FieldError, FieldLabel } from '~/app/components/field'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/typography'
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
  const [permissions, setPermissions] = React.useState({ owner: false, read: false, write: false })

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
      setPermissions({ owner: true, read: true, write: true })
    }
  }, [isOpen, form])

  const canSubmit = form.state.canSubmit && !isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <IconBox variant='primary' size='sm'>
            <Lucide.Box className='size-4' />
          </IconBox>
          <DialogTitle>Create Bucket</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='border-border mt-3 border-t pt-4'>
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

            <div className='border-border bg-muted/5 mt-4 rounded-lg border p-4'>
              <Text className='text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase'>
                Default Permissions
              </Text>
              <div className='grid grid-cols-3 gap-2'>
                <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                  <Checkbox
                    id='owner'
                    checked={permissions.owner}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, owner: checked as boolean })
                    }
                  />
                  <span className='text-sm font-medium'>Owner</span>
                </div>
                <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                  <Checkbox
                    id='read'
                    checked={permissions.read}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, read: checked as boolean })
                    }
                  />
                  <span className='text-sm font-medium'>Read</span>
                </div>
                <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                  <Checkbox
                    id='write'
                    checked={permissions.write}
                    onCheckedChange={(checked) =>
                      setPermissions({ ...permissions, write: checked as boolean })
                    }
                  />
                  <span className='text-sm font-medium'>Write</span>
                </div>
              </div>
            </div>
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
