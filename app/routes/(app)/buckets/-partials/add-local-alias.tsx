import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/app/components/button'
import {
  Dialog,
  DialogBody,
  DialogPopup,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from '~/app/components/dialog'
import { IconBox } from '~/app/components/icon-box'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'

interface AddLocalAliasProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (localAlias: { accessKeyId: string; alias: string }) => Promise<void>
  isSubmitting?: boolean
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

export function AddLocalAlias({ isOpen, onClose, onSubmit, isSubmitting }: AddLocalAliasProps) {
  const Form = useForm({
    defaultValues: {
      accessKeyId: '',
      alias: ''
    },
    onSubmit: async ({ value }) => {
      await onSubmit({ accessKeyId: value.accessKeyId, alias: value.alias })
    }
  })

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  React.useEffect(() => {
    if (isOpen) {
      Form.reset()
    }
  }, [isOpen, Form])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPopup>
        <DialogHeader>
          <Stack direction='row' className='items-start'>
            <IconBox variant='tertiary' size='md' circle>
              <Lucide.Key className='size-5' />
            </IconBox>
            <div>
              <DialogTitle>Add Local Alias</DialogTitle>
              <Text className='text-muted-foreground text-sm'>
                Add a local alias to this bucket
              </Text>
            </div>
          </Stack>
        </DialogHeader>

        <DialogBody>
          <form
            className={`space-y-4 ${isSubmitting ? 'animate-pulse' : ''}`}
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              Form.handleSubmit()
            }}
          >
            <Form.Field
              name='accessKeyId'
              validators={{
                onChange: ({ value }) => {
                  const result = addLocalAliasSchema.shape.accessKeyId.safeParse(value)
                  if (!result.success) {
                    const firstError = result.error.issues[0]
                    return firstError ? firstError.message : undefined
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <Stack>
                  <Label htmlFor='accessKeyId'>
                    Access Key ID <Text className='text-danger'>*</Text>
                  </Label>
                  <Input
                    id='accessKeyId'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='GK1234567890abcdef'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <Text className='text-danger'>{String(field.state.meta.errors[0])}</Text>
                  )}
                </Stack>
              )}
            </Form.Field>

            <Form.Field
              name='alias'
              validators={{
                onChange: ({ value }) => {
                  const result = addLocalAliasSchema.shape.alias.safeParse(value)
                  if (!result.success) {
                    const firstError = result.error.issues[0]
                    return firstError ? firstError.message : undefined
                  }
                  return undefined
                }
              }}
            >
              {(field) => (
                <Stack>
                  <Label htmlFor='alias'>
                    Local Alias <Text className='text-danger'>*</Text>
                  </Label>
                  <Input
                    id='alias'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='my-bucket-alias'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <Text className='text-danger'>{String(field.state.meta.errors[0])}</Text>
                  )}
                </Stack>
              )}
            </Form.Field>

            <div className='border-tertiary/20 bg-tertiary/5 rounded-lg border p-3'>
              <div className='flex items-start gap-2'>
                <IconBox variant='tertiary' size='sm' className='mt-0.5'>
                  <Lucide.Info className='size-4' />
                </IconBox>
                <Text className='text-tertiary-foreground text-xs'>
                  Local aliases are accessible only by the specified access key. Use lowercase
                  letters, numbers, and dashes only.
                </Text>
              </div>
            </div>

            <Stack>
              <Button type='button' variant='outline' onClick={onClose}>
                Cancel
              </Button>
              <Button
                type='button'
                variant='primary'
                disabled={!Form.state.canSubmit || Form.state.isSubmitting || isSubmitting}
                progress={isSubmitting || Form.state.isSubmitting}
                onClick={() => Form.handleSubmit()}
              >
                {isSubmitting || Form.state.isSubmitting ? 'Adding...' : 'Add Alias'}
              </Button>
            </Stack>
          </form>
        </DialogBody>

        <DialogFooter />
      </DialogPopup>
    </Dialog>
  )
}
