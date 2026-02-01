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
import { InputPassword } from '~/app/components/input-password'
import { Spinner } from '~/app/components/spinner'
import type { ImportKeyRequest } from '~/shared/schemas/keys.schema'

interface KeyImportProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ImportKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

const importKeySchema = z.object({
  accessKeyId: z.string().min(1, 'Access Key ID is required'),
  secretAccessKey: z.string().min(1, 'Secret Key ID is required'),
  name: z.string().max(100, 'Name must be less than 100 characters').optional()
})

export function KeyImport({ isOpen, onClose, onSubmit, isSubmitting }: KeyImportProps) {
  const form = useForm({
    defaultValues: {
      accessKeyId: '',
      secretAccessKey: '',
      name: ''
    },
    onSubmit: async ({ value }) => {
      const result = importKeySchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }

      await onSubmit({
        accessKeyId: value.accessKeyId,
        secretAccessKey: value.secretAccessKey,
        name: value.name || null
      })
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
          <IconBox variant='primary' size='sm'>
            <Lucide.Download className='size-4' />
          </IconBox>
          <DialogTitle>Import Access Key</DialogTitle>

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
                  if (value) {
                    const result = importKeySchema.shape.name.safeParse(value)
                    if (!result.success) {
                      const firstError = result.error.issues[0]
                      return firstError ? firstError.message : undefined
                    }
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
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., Imported Key from Production'
                    disabled={isSubmitting}
                  />
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                </Field>
              )}
            </form.Field>

            <form.Field
              name='accessKeyId'
              validators={{
                onChange: ({ value }) => {
                  const result = importKeySchema.shape.accessKeyId.safeParse(value)
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
                  <FieldLabel htmlFor='accessKeyId'>Access Key ID</FieldLabel>
                  <Input
                    id='accessKeyId'
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., GK1234567890abcdef'
                    className='font-mono'
                    disabled={isSubmitting}
                  />
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
                </Field>
              )}
            </form.Field>

            <form.Field
              name='secretAccessKey'
              validators={{
                onChange: ({ value }) => {
                  const result = importKeySchema.shape.secretAccessKey.safeParse(value)
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
                  <FieldLabel htmlFor='secretKeyId'>Secret Key ID</FieldLabel>
                  <InputPassword
                    id='secretKeyId'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
                    className='font-mono'
                    disabled={isSubmitting}
                  />
                  <FieldError>{field.state.meta.errors[0]}</FieldError>
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
                {isSubmitting || isSubmittingForm ? (
                  <span className='flex items-center gap-2'>
                    <Spinner className='size-4' strokeWidth={2.0} />
                    Importing...
                  </span>
                ) : (
                  'Import Key'
                )}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
