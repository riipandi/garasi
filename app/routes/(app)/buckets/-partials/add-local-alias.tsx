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
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'

interface AddLocalAliasProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (localAlias: { accessKeyId: string; alias: string }) => Promise<void>
  isSubmitting?: boolean
  keys: ListAccessKeysResponse[]
}

const addLocalAliasSchema = z.object({
  accessKeyId: z.string().min(1, 'Access Key ID is required'),
  alias: z
    .string()
    .min(1, 'Local alias is required')
    .max(100, 'Local alias must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Local alias must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Local alias cannot contain spaces')
})

export function AddLocalAlias({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  keys
}: AddLocalAliasProps) {
  const [accessKeyId, setAccessKeyId] = React.useState('')
  const [alias, setAlias] = React.useState('')
  const [errors, setErrors] = React.useState<{ accessKeyId?: string; alias?: string }>({})

  React.useEffect(() => {
    if (isOpen) {
      setAccessKeyId('')
      setAlias('')
      setErrors({})
    }
  }, [isOpen])

  const validate = () => {
    const result = addLocalAliasSchema.safeParse({ accessKeyId, alias })
    if (!result.success) {
      const newErrors: { accessKeyId?: string; alias?: string } = {}
      for (const issue of result.error.issues) {
        const path = issue.path[0] as 'accessKeyId' | 'alias'
        newErrors[path] = issue.message
      }
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (validate()) {
      await onSubmit({ accessKeyId, alias })
    }
  }

  const handleAccessKeyChange = (value: string) => {
    setAccessKeyId(value)
    if (errors.accessKeyId) {
      setErrors((prev) => ({ ...prev, accessKeyId: undefined }))
    }
  }

  const handleAliasChange = (value: string) => {
    setAlias(value)
    if (errors.alias) {
      setErrors((prev) => ({ ...prev, alias: undefined }))
    }
  }

  const canSubmit = accessKeyId.trim() !== '' && alias.trim() !== '' && !isSubmitting

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <IconBox variant='primary' size='sm'>
            <Lucide.Key className='size-4' />
          </IconBox>
          <DialogTitle>Add Local Alias</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>
        <DialogBody className='border-border mt-3 border-t pt-4'>
          <form onSubmit={handleSubmit}>
            <Field>
              <FieldLabel htmlFor='accessKeyId'>Access Key ID</FieldLabel>
              <select
                id='accessKeyId'
                value={accessKeyId}
                onChange={(e) => handleAccessKeyChange(e.target.value)}
                disabled={isSubmitting}
                className='bg-input placeholder:text-dimmed shadow-input border-input-border focus:ring-primary h-9 w-full rounded border px-3 py-1 transition-all focus:border-transparent focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value=''>Select a key...</option>
                {keys.map((key) => (
                  <option key={key.id} value={key.id}>
                    {key.name} ({key.id})
                  </option>
                ))}
              </select>
              {errors.accessKeyId && <FieldError>{errors.accessKeyId}</FieldError>}
            </Field>

            <Field className='mt-4'>
              <FieldLabel htmlFor='alias'>Local Alias</FieldLabel>
              <Input
                id='alias'
                type='text'
                value={alias}
                onChange={(e) => handleAliasChange(e.target.value)}
                placeholder='my-bucket-alias'
                disabled={isSubmitting}
              />
              {errors.alias && <FieldError>{errors.alias}</FieldError>}
            </Field>

            <div className='border-tertiary/20 bg-tertiary/5 mt-4 rounded-lg border p-3'>
              <div className='flex items-start gap-2'>
                <IconBox variant='tertiary' size='sm' className='mt-0.5'>
                  <Lucide.Info className='size-4' />
                </IconBox>
                <p className='text-sm'>
                  Local aliases are accessible only by the specified access key. Use lowercase
                  letters, numbers, and dashes only.
                </p>
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogClose block>Cancel</DialogClose>
          <Button type='button' disabled={!canSubmit} onClick={handleSubmit} block>
            {isSubmitting ? (
              <span className='flex items-center gap-2'>
                <Spinner className='size-4' strokeWidth={2.0} />
                Adding...
              </span>
            ) : (
              'Add Alias'
            )}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
