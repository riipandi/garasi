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
import { Form } from '~/app/components/form'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Spinner } from '~/app/components/spinner'

interface AddGlobalAliasProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (globalAlias: string) => Promise<void>
  isSubmitting?: boolean
}

const addGlobalAliasSchema = z.object({
  globalAlias: z
    .string()
    .min(1, 'Global alias is required')
    .max(100, 'Global alias must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Global alias must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Global alias cannot contain spaces')
})

export function AddGlobalAlias({ isOpen, onClose, onSubmit, isSubmitting }: AddGlobalAliasProps) {
  const form = useForm({
    defaultValues: {
      globalAlias: ''
    },
    validators: {
      onChange: ({ value }) => {
        const result = addGlobalAliasSchema.shape.globalAlias.safeParse(value.globalAlias)
        if (!result.success) {
          const firstError = result.error.issues[0]
          return firstError ? { globalAlias: firstError.message } : undefined
        }
        return undefined
      }
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value.globalAlias)
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
            <Lucide.Globe className='size-4' />
          </IconBox>
          <DialogTitle>Add Global Alias</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>
        <DialogBody className='border-border mt-3 border-t pt-0'>
          <Form onSubmit={handleSubmit}>
            <form.Field name='globalAlias'>
              {(field) => (
                <Field className='mt-4'>
                  <FieldLabel htmlFor='globalAlias'>Global Alias</FieldLabel>
                  <Input
                    id='globalAlias'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='my-bucket-alias'
                    disabled={isSubmitting}
                  />
                  <FieldError match={!field.state.meta.isValid}>
                    {field.state.meta.errors.join(', ')}
                  </FieldError>
                </Field>
              )}
            </form.Field>

            <div className='border-info/20 bg-info/5 rounded-lg border p-3'>
              <div className='flex items-start gap-2'>
                <IconBox variant='info' size='sm' className='mt-0.5'>
                  <Lucide.Info className='size-4' />
                </IconBox>
                <p className='text-foreground text-sm'>
                  Global aliases are accessible by all keys. Use lowercase letters, numbers, and
                  dashes only.
                </p>
              </div>
            </div>
          </Form>
        </DialogBody>
        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmittingForm]) => (
              <Button
                type='button'
                disabled={!canSubmit || isSubmittingForm || isSubmitting}
                onClick={() => form.handleSubmit()}
                block
              >
                {isSubmitting || isSubmittingForm ? (
                  <span className='flex items-center gap-2'>
                    <Spinner className='size-4' strokeWidth={2.0} />
                    Adding...
                  </span>
                ) : (
                  'Add Alias'
                )}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
