import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import type { CreateBucketRequest } from './types'

interface BucketCreateProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: CreateBucketRequest) => Promise<void>
  isSubmitting?: boolean
}

const createBucketSchema = z.object({
  bucketName: z
    .string()
    .min(1, 'Bucket name is required')
    .max(100, 'Bucket name must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Bucket name must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Bucket name cannot contain spaces'),
  enableLocalAlias: z.boolean().optional(),
  localAlias: z.string().max(100, 'Local alias must be less than 100 characters').optional(),
  accessKeyId: z.string().min(1, 'Access Key ID is required when using local alias').optional(),
  allowOwner: z.boolean().optional(),
  allowRead: z.boolean().optional(),
  allowWrite: z.boolean().optional()
})

export function BucketCreate({ isOpen, onClose, onSubmit, isSubmitting }: BucketCreateProps) {
  const Form = useForm({
    defaultValues: {
      bucketName: '',
      enableLocalAlias: false,
      localAlias: '',
      accessKeyId: '',
      allowOwner: false,
      allowRead: false,
      allowWrite: false
    },
    onSubmit: async ({ value }) => {
      // Validate bucket name (global alias) - mandatory
      if (!value.bucketName || value.bucketName.trim() === '') {
        throw new Error('Bucket name (global alias) is required')
      }

      // Validate local alias if enabled
      if (value.enableLocalAlias) {
        if (!value.localAlias || value.localAlias.trim() === '') {
          throw new Error('Local alias is required when local alias is enabled')
        }
        if (!value.accessKeyId || value.accessKeyId.trim() === '') {
          throw new Error('Access Key ID is required when using local alias')
        }
      }

      const submitValue: CreateBucketRequest = {
        globalAlias: value.bucketName || null,
        localAlias:
          value.enableLocalAlias && value.localAlias && value.accessKeyId
            ? {
                accessKeyId: value.accessKeyId,
                alias: value.localAlias,
                allow: {
                  owner: value.allowOwner || undefined,
                  read: value.allowRead || undefined,
                  write: value.allowWrite || undefined
                }
              }
            : null
      }

      await onSubmit(submitValue)
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
      <div className='animate-in zoom-in-95 fade-in w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg duration-200'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100'>
              <Lucide.Database className='size-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Create Bucket</h2>
              <p className='text-sm text-gray-600'>Create a new bucket to store your data</p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            aria-label='Close dialog'
          >
            <Lucide.X className='size-5' />
          </button>
        </div>

        {/* Form */}
        <form
          className={`space-y-4 ${isSubmitting ? 'animate-pulse' : ''}`}
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            Form.handleSubmit()
          }}
        >
          {/* Bucket Name (Global Alias) - Mandatory */}
          <Form.Field
            name='bucketName'
            validators={{
              onChange: ({ value }) => {
                const result = createBucketSchema.shape.bucketName.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }
                return undefined
              }
            }}
            children={(field) => (
              <div>
                <label htmlFor='bucketName' className='block text-sm font-medium text-gray-700'>
                  Bucket Name (Global Alias) <span className='text-red-500'>*</span>
                </label>
                <input
                  id='bucketName'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='my-bucket'
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isSubmitting}
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          {/* Toggle for Local Alias */}
          <Form.Subscribe
            selector={(state) => state.values.enableLocalAlias}
            children={(_enableLocalAliasValue) => (
              <Form.Field
                name='enableLocalAlias'
                children={(field) => (
                  <div className='flex items-center gap-2'>
                    <input
                      id='enableLocalAlias'
                      name={field.name}
                      type='checkbox'
                      checked={field.state.value}
                      onChange={(e) => {
                        const newValue = e.target.checked
                        field.handleChange(newValue)
                        // Reset local alias fields when disabled
                        if (!newValue) {
                          Form.setFieldValue('localAlias', '')
                          Form.setFieldValue('accessKeyId', '')
                          Form.setFieldValue('allowOwner', false)
                          Form.setFieldValue('allowRead', false)
                          Form.setFieldValue('allowWrite', false)
                          // Trigger re-validation by setting the same value again
                          setTimeout(() => {
                            Form.setFieldValue('localAlias', '')
                            Form.setFieldValue('accessKeyId', '')
                          }, 0)
                        }
                      }}
                      className='size-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      disabled={isSubmitting}
                    />
                    <label htmlFor='enableLocalAlias' className='text-sm font-medium text-gray-700'>
                      Add Local Alias (Optional)
                    </label>
                  </div>
                )}
              />
            )}
          />

          {/* Local Alias Section - Only shown when enabled */}
          <Form.Subscribe
            selector={(state) => state.values.enableLocalAlias}
            children={(enableLocalAlias) =>
              enableLocalAlias && (
                <div className='space-y-4 rounded-md border border-gray-200 bg-gray-50 p-4'>
                  {/* Local Alias Name */}
                  <Form.Field
                    name='localAlias'
                    validators={{
                      onChange: ({ value }) => {
                        // Only validate if local alias is enabled
                        if (!Form.state.values.enableLocalAlias) {
                          return undefined
                        }
                        // Manual validation
                        if (!value || value.trim() === '') {
                          return 'Local alias is required when local alias is enabled'
                        }
                        if (value.length > 100) {
                          return 'Local alias must be less than 100 characters'
                        }
                        return undefined
                      },
                      onBlur: ({ value }) => {
                        // Only validate if local alias is enabled
                        if (!Form.state.values.enableLocalAlias) {
                          return undefined
                        }
                        // Manual validation
                        if (!value || value.trim() === '') {
                          return 'Local alias is required when local alias is enabled'
                        }
                        if (value.length > 100) {
                          return 'Local alias must be less than 100 characters'
                        }
                        return undefined
                      }
                    }}
                    children={(field) => (
                      <div>
                        <label
                          htmlFor='localAlias'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Local Alias Name <span className='text-red-500'>*</span>
                        </label>
                        <input
                          id='localAlias'
                          name={field.name}
                          type='text'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder='my-bucket'
                          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          disabled={isSubmitting}
                        />
                        {field.state.meta.errors[0] && (
                          <p className='mt-1 text-xs text-red-600'>
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Access Key ID */}
                  <Form.Field
                    name='accessKeyId'
                    validators={{
                      onChange: ({ value }) => {
                        // Only validate if local alias is enabled
                        if (!Form.state.values.enableLocalAlias) {
                          return undefined
                        }
                        // Manual validation
                        if (!value || value.trim() === '') {
                          return 'Access Key ID is required when using local alias'
                        }
                        return undefined
                      },
                      onBlur: ({ value }) => {
                        // Only validate if local alias is enabled
                        if (!Form.state.values.enableLocalAlias) {
                          return undefined
                        }
                        // Manual validation
                        if (!value || value.trim() === '') {
                          return 'Access Key ID is required when using local alias'
                        }
                        return undefined
                      }
                    }}
                    children={(field) => (
                      <div>
                        <label
                          htmlFor='accessKeyId'
                          className='block text-sm font-medium text-gray-700'
                        >
                          Access Key ID <span className='text-red-500'>*</span>
                        </label>
                        <input
                          id='accessKeyId'
                          name={field.name}
                          type='text'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder='GK1234567890abcdef'
                          className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                          disabled={isSubmitting}
                        />
                        {field.state.meta.errors[0] && (
                          <p className='mt-1 text-xs text-red-600'>
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {/* Permissions */}
                  <div className='mt-2 p-0'>
                    <h4 className='mb-3 text-sm font-medium text-gray-900'>Permissions</h4>
                    <div className='inline-flex w-full gap-8'>
                      <Form.Field
                        name='allowOwner'
                        children={(field) => (
                          <div className='flex items-center'>
                            <input
                              id='allowOwner'
                              name={field.name}
                              type='checkbox'
                              checked={field.state.value}
                              onChange={(e) => field.handleChange(e.target.checked)}
                              className='size-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                              disabled={isSubmitting}
                            />
                            <label htmlFor='allowOwner' className='ml-2 text-sm text-gray-700'>
                              Owner
                            </label>
                          </div>
                        )}
                      />

                      <Form.Field
                        name='allowRead'
                        children={(field) => (
                          <div className='flex items-center'>
                            <input
                              id='allowRead'
                              name={field.name}
                              type='checkbox'
                              checked={field.state.value}
                              onChange={(e) => field.handleChange(e.target.checked)}
                              className='size-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                              disabled={isSubmitting}
                            />
                            <label htmlFor='allowRead' className='ml-2 text-sm text-gray-700'>
                              Read
                            </label>
                          </div>
                        )}
                      />

                      <Form.Field
                        name='allowWrite'
                        children={(field) => (
                          <div className='flex items-center'>
                            <input
                              id='allowWrite'
                              name={field.name}
                              type='checkbox'
                              checked={field.state.value}
                              onChange={(e) => field.handleChange(e.target.checked)}
                              className='size-4 rounded border-gray-300 text-blue-600 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                              disabled={isSubmitting}
                            />
                            <label htmlFor='allowWrite' className='ml-2 text-sm text-gray-700'>
                              Write
                            </label>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              )
            }
          />

          {/* Actions */}
          <Form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmittingForm]) => (
              <div className='flex justify-end gap-3 pt-4'>
                <button
                  type='button'
                  onClick={onClose}
                  className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={!canSubmit || isSubmittingForm || isSubmitting}
                  className={`rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSubmitting || isSubmittingForm ? 'animate-pulse' : ''
                  }`}
                >
                  {isSubmitting || isSubmittingForm ? (
                    <span className='flex items-center gap-2'>
                      <svg className='size-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'
                        />
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Bucket'
                  )}
                </button>
              </div>
            )}
          />
        </form>

        {/* Info Box */}
        <div className='mt-4 rounded-md border border-blue-200 bg-blue-50 p-3'>
          <div className='flex gap-2'>
            <Lucide.Info className='mt-0.5 size-4 shrink-0 text-blue-600' />
            <p className='text-xs text-blue-700'>
              The bucket name serves as the global alias and is mandatory. A local alias is optional
              and allows access only by the specified access key with custom permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
