import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
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
      // Validate bucket name (global alias) - mandatory
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
  }, [isOpen, onClose])

  React.useEffect(() => {
    if (isOpen) {
      Form.reset()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='animate-in fade-in zoom-in-95 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-lg duration-200 sm:p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-gray-900'>Create Bucket</h2>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
          >
            <Lucide.X className='size-5' />
          </button>
        </div>

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
            children={(field) => (
              <div>
                <label
                  htmlFor='globalAlias'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  Global Alias <span className='text-red-500'>*</span>
                </label>
                <input
                  id='globalAlias'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='my-bucket'
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                  disabled={isSubmitting}
                  autoFocus
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

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
            children={(field) => (
              <div>
                <label
                  htmlFor='localAlias.alias'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  Local Alias
                </label>
                <input
                  id='localAlias.alias'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='my-local-alias'
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                  disabled={isSubmitting}
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

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
            children={(field) => (
              <div>
                <label
                  htmlFor='localAlias.accessKeyId'
                  className='mb-1.5 block text-sm font-medium text-gray-700'
                >
                  Access Key ID
                </label>
                <input
                  id='localAlias.accessKeyId'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='GK...'
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
                  disabled={isSubmitting}
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-sm text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          <div className='space-y-2 pt-2'>
            <Form.Field
              name='localAlias.allow.owner'
              children={(field) => (
                <div className='flex items-center gap-2'>
                  <input
                    id='localAlias.allow.owner'
                    name={field.name}
                    type='checkbox'
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2'
                    disabled={isSubmitting}
                  />
                  <label htmlFor='localAlias.allow.owner' className='text-sm text-gray-700'>
                    Owner
                  </label>
                </div>
              )}
            />

            <Form.Field
              name='localAlias.allow.read'
              children={(field) => (
                <div className='flex items-center gap-2'>
                  <input
                    id='localAlias.allow.read'
                    name={field.name}
                    type='checkbox'
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2'
                    disabled={isSubmitting}
                  />
                  <label htmlFor='localAlias.allow.read' className='text-sm text-gray-700'>
                    Read
                  </label>
                </div>
              )}
            />

            <Form.Field
              name='localAlias.allow.write'
              children={(field) => (
                <div className='flex items-center gap-2'>
                  <input
                    id='localAlias.allow.write'
                    name={field.name}
                    type='checkbox'
                    checked={field.state.value}
                    onChange={(e) => field.handleChange(e.target.checked)}
                    className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-2'
                    disabled={isSubmitting}
                  />
                  <label htmlFor='localAlias.allow.write' className='text-sm text-gray-700'>
                    Write
                  </label>
                </div>
              )}
            />
          </div>

          <Form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmittingForm]) => (
              <button
                type='submit'
                disabled={!canSubmit || isSubmittingForm || isSubmitting}
                className={`w-full rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                  isSubmitting || isSubmittingForm ? 'animate-pulse' : ''
                }`}
              >
                {isSubmitting || isSubmittingForm ? 'Creating...' : 'Create Bucket'}
              </button>
            )}
          />
        </form>
      </div>
    </div>
  )
}
