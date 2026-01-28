import { useForm } from '@tanstack/react-form'
import * as React from 'react'
import { z } from 'zod'
import { Dialog, DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogTitle } from '~/app/components/dialog'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
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
  const Form = useForm({
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
      Form.reset()
    }
  }, [isOpen, Form])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Import Access Key</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody>
          <DialogDescription>
            Import an existing access key from another Garage instance
          </DialogDescription>
          <Stack direction='column' spacing='md' className='mt-4'>
            <Form.Field
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
              children={(field) => (
                <div>
                  <Label htmlFor='accessKeyId'>
                    Access Key ID <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='accessKeyId'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., GK1234567890abcdef'
                    className='font-mono'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            />

            <Form.Field
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
              children={(field) => (
                <div>
                  <Label htmlFor='secretKeyId'>
                    Secret Key ID <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='secretKeyId'
                    name={field.name}
                    type='password'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
                    className='font-mono'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            />

            <Form.Field
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
              children={(field) => (
                <div>
                  <Label htmlFor='name'>Name (optional)</Label>
                  <Input
                    id='name'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='e.g., Imported Key from Production'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                  )}
                </div>
              )}
            />
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
                          Importing...
                        </>
                      ) : (
                        'Import Key'
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
