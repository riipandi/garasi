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
import { Field, FieldLabel, FieldError } from '~/app/components/field'
import { Form } from '~/app/components/form'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'

interface CreateFolderDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (folderName: string) => void
  isSubmitting?: boolean
}

const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name must be less than 255 characters')
    .regex(/^[^/\\?%*:|"<>]+$/, 'Folder name contains invalid characters')
    .refine((val) => !val.startsWith('.'), 'Folder name cannot start with a dot')
    .refine((val) => !val.endsWith('.'), 'Folder name cannot end with a dot')
})

export function CreateFolderDialog({
  isOpen,
  onClose,
  onCreate,
  isSubmitting
}: CreateFolderDialogProps) {
  const form = useForm({
    defaultValues: {
      name: ''
    },
    validators: {
      onChange: ({ value }) => {
        const result = createFolderSchema.safeParse(value)
        if (!result.success) {
          const firstError = result.error.issues[0]
          return firstError ? firstError.message : undefined
        }
        return undefined
      }
    },
    onSubmit: async ({ value }) => {
      const result = createFolderSchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }

      onCreate(value.name.trim())
      form.reset()
    }
  })

  React.useEffect(() => {
    if (isOpen) {
      form.reset()
    }
  }, [isOpen, form])

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    form.handleSubmit()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <IconBox variant='info' size='sm'>
            <Lucide.FolderPlus className='size-4' />
          </IconBox>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='border-border mt-3 border-t pt-0'>
          <Form onSubmit={handleSubmit}>
            <form.Field
              name='name'
              validators={{
                onChange: ({ value }) => {
                  const result = createFolderSchema.shape.name.safeParse(value)
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
                  <FieldLabel htmlFor='name'>Folder Name</FieldLabel>
                  <Input
                    id='name'
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., documents, images, 2024'
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <FieldError match={!field.state.meta.isValid}>
                    {field.state.meta.errors.join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.Field>
          </Form>
        </DialogBody>

        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmittingForm]) => (
              <Button
                type='button'
                size='sm'
                disabled={!canSubmit || isSubmittingForm || isSubmitting}
                onClick={() => form.handleSubmit()}
                block
              >
                {isSubmitting || isSubmittingForm ? 'Creating...' : 'Create'}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
