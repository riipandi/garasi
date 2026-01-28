import { useForm } from '@tanstack/react-form'
import * as React from 'react'
import { z } from 'zod'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogPopup,
  DialogTitle,
  DialogFooter,
  DialogHeader
} from '~/app/components/dialog'
import { Input } from '~/app/components/input'
import { Label } from '~/app/components/label'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import type { CreateBucketRequest } from '~/shared/schemas/bucket.schema'

interface BucketCreateProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateBucketRequest) => Promise<void>
  isSubmitting?: boolean
}

const createBucketSchema = z.object({
  globalAlias: z.string().max(100, 'Global alias must be less than 100 characters').optional(),
  localAlias: z
    .object({
      alias: z.string().max(100, 'Local alias must be less than 100 characters'),
      accessKeyId: z.string().min(1, 'Access Key ID is required when using local alias').optional(),
      allow: z
        .object({
          owner: z.boolean().optional(),
          read: z.boolean().optional(),
          write: z.boolean().optional()
        })
        .optional()
    })
    .optional()
})

export function BucketCreate({ isOpen, onClose, onSubmit, isSubmitting }: BucketCreateProps) {
  const Form = useForm({
    defaultValues: {
      globalAlias: '',
      localAlias: {
        alias: '',
        accessKeyId: '',
        allow: {
          owner: false,
          read: false,
          write: false
        }
      }
    },
    onSubmit: async ({ value }) => {
      if (!value.globalAlias || value.globalAlias.trim() === '') {
        throw new Error('Bucket name (global alias) is required')
      }

      const createValues: CreateBucketRequest = {
        globalAlias: value.globalAlias,
        localAlias: value.localAlias || null
      }

      await onSubmit(createValues)
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
          <DialogTitle>Create Bucket</DialogTitle>
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
                  const result = createBucketSchema.shape.globalAlias.safeParse(value)
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
                    placeholder='my-bucket'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <Text className='text-danger'>{String(field.state.meta.errors[0])}</Text>
                  )}
                </Stack>
              )}
            </Form.Field>

            <Form.Field
              name='localAlias.alias'
              validators={{
                onChange: ({ value }) => {
                  const result = createBucketSchema.shape.localAlias.safeParse({
                    alias: value,
                    allow: { owner: false, read: false, write: false }
                  })
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
                  <Label htmlFor='localAlias.alias'>Local Alias</Label>
                  <Input
                    id='localAlias.alias'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='my-local-alias'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <Text className='text-danger'>{String(field.state.meta.errors[0])}</Text>
                  )}
                </Stack>
              )}
            </Form.Field>

            <Form.Field
              name='localAlias.accessKeyId'
              validators={{
                onChange: ({ value }) => {
                  const result = createBucketSchema.shape.localAlias.safeParse({
                    alias: '',
                    accessKeyId: value,
                    allow: { owner: false, read: false, write: false }
                  })
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
                  <Label htmlFor='localAlias.accessKeyId'>Access Key ID</Label>
                  <Input
                    id='localAlias.accessKeyId'
                    name={field.name}
                    type='text'
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder='GK...'
                    disabled={isSubmitting}
                  />
                  {field.state.meta.errors[0] && (
                    <Text className='text-danger'>{String(field.state.meta.errors[0])}</Text>
                  )}
                </Stack>
              )}
            </Form.Field>

            <Stack>
              <Form.Field name='localAlias.allow.owner'>
                {(field) => (
                  <div className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      id='localAlias.allow.owner'
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                      disabled={isSubmitting}
                    />
                    <Text>Owner</Text>
                  </div>
                )}
              </Form.Field>

              <Form.Field name='localAlias.allow.read'>
                {(field) => (
                  <div className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      id='localAlias.allow.read'
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                      disabled={isSubmitting}
                    />
                    <Text>Read</Text>
                  </div>
                )}
              </Form.Field>

              <Form.Field name='localAlias.allow.write'>
                {(field) => (
                  <div className='flex cursor-pointer items-center gap-2'>
                    <Checkbox
                      id='localAlias.allow.write'
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                      disabled={isSubmitting}
                    />
                    <Text>Write</Text>
                  </div>
                )}
              </Form.Field>
            </Stack>
          </form>
        </DialogBody>

        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button
            type='button'
            variant='primary'
            disabled={!Form.state.canSubmit || Form.state.isSubmitting || isSubmitting}
            progress={isSubmitting || Form.state.isSubmitting}
            onClick={() => Form.handleSubmit()}
          >
            {isSubmitting || Form.state.isSubmitting ? 'Creating...' : 'Create Bucket'}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  )
}
