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
  const Form = useForm({
    defaultValues: {
      globalAlias: ''
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value.globalAlias)
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
            <IconBox variant='info' size='md' circle>
              <Lucide.Globe className='size-5' />
            </IconBox>
            <div>
              <DialogTitle>Add Global Alias</DialogTitle>
              <Text className='text-muted-foreground text-sm'>
                Add a global alias to this bucket
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
              name='globalAlias'
              validators={{
                onChange: ({ value }) => {
                  const result = addGlobalAliasSchema.shape.globalAlias.safeParse(value)
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
                  <Label htmlFor='globalAlias'>
                    Global Alias <Text className='text-danger'>*</Text>
                  </Label>
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
                  {field.state.meta.errors[0] && (
                    <Text className='text-danger'>{String(field.state.meta.errors[0])}</Text>
                  )}
                </Stack>
              )}
            </Form.Field>

            <div className='border-info/20 bg-info/5 rounded-lg border p-3'>
              <div className='flex items-start gap-2'>
                <IconBox variant='info' size='sm' className='mt-0.5'>
                  <Lucide.Info className='size-4' />
                </IconBox>
                <Text className='text-info-foreground text-xs'>
                  Global aliases are accessible by all keys. Use lowercase letters, numbers, and
                  dashes only.
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
