import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import type {
  GetKeyInformationResponse,
  UpdateAccessKeyRequest
} from '~/shared/schemas/keys.schema'

// Extend the schema type with additional properties needed by the UI
interface AccessKey extends GetKeyInformationResponse {
  deleted?: boolean
  neverExpires?: boolean
  secretKeyId?: string
}

interface KeyEditProps {
  isOpen: boolean
  accessKey: AccessKey
  onClose: () => void
  onSubmit: (values: UpdateAccessKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

const updateKeySchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-z0-9-]+$/, 'Name must contain only lowercase letters, numbers, and dashes')
    .refine((val) => !val.includes(' '), 'Name cannot contain spaces'),
  neverExpires: z.boolean().default(false),
  expiration: z.string().nullable().optional(),
  allowCreateBucket: z.boolean().default(false)
})

export function KeyEdit({ isOpen, accessKey, onClose, onSubmit, isSubmitting }: KeyEditProps) {
  const Form = useForm({
    defaultValues: {
      name: accessKey.name || '',
      neverExpires: accessKey.neverExpires || false,
      expiration: accessKey.expiration || '',
      allowCreateBucket: accessKey.permissions?.createBucket ?? false
    },
    onSubmit: async ({ value }) => {
      const result = updateKeySchema.safeParse(value)
      if (!result.success) {
        const firstError = result.error.issues[0]
        if (firstError) {
          throw new Error(firstError.message)
        }
        return
      }

      const submitValue: UpdateAccessKeyRequest = {
        name: value.name,
        neverExpires: value.neverExpires,
        expiration: value.neverExpires ? null : value.expiration || null,
        allow: value.allowCreateBucket ? { createBucket: true } : null,
        deny: value.allowCreateBucket ? null : { createBucket: true }
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
      Form.reset({
        name: accessKey.name || '',
        neverExpires: accessKey.neverExpires || false,
        expiration: accessKey.expiration || '',
        allowCreateBucket: accessKey.permissions?.createBucket ?? false
      })
    }
  }, [isOpen, accessKey])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='animate-in zoom-in-95 fade-in w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-lg duration-200 sm:p-6'>
        {/* Header */}
        <div className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100'>
                <Lucide.KeyRound className='size-5 text-blue-600' />
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Edit Access Key</h2>
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
          <p className='text-sm text-gray-600'>Update the access key details</p>
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
          <Form.Field
            name='name'
            validators={{
              onChange: ({ value }) => {
                const result = updateKeySchema.shape.name.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }
                return undefined
              }
            }}
            children={(field) => (
              <div>
                <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                  Name <span className='text-red-500'>*</span>
                </label>
                <input
                  id='name'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) =>
                    field.handleChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                  }
                  placeholder='e.g., production-api-key'
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isSubmitting}
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          <Form.Subscribe
            selector={(state) => state.values.neverExpires}
            children={(neverExpires) => (
              <Form.Field
                name='expiration'
                validators={{
                  onChange: ({ value }) => {
                    // Only validate if neverExpires is false
                    if (!neverExpires) {
                      if (!value || value.trim() === '') {
                        return 'Expiration Date is required when "Never expires" is unchecked'
                      }
                    }
                    return undefined
                  }
                }}
                children={(field) => (
                  <div>
                    <label htmlFor='expiration' className='block text-sm font-medium text-gray-700'>
                      Expiration Date{!neverExpires && <span className='text-red-500'> *</span>}
                    </label>
                    <input
                      id='expiration'
                      name={field.name}
                      type='datetime-local'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      disabled={isSubmitting || neverExpires}
                    />
                    {field.state.meta.errors[0] && (
                      <p className='mt-1 text-xs text-red-600'>
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              />
            )}
          />

          <Form.Field
            name='neverExpires'
            children={(field) => (
              <div className='flex items-center gap-2'>
                <input
                  id='neverExpires'
                  name={field.name}
                  type='checkbox'
                  checked={field.state.value}
                  onChange={(e) => {
                    const newValue = e.target.checked
                    field.handleChange(newValue)
                  }}
                  className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isSubmitting}
                />
                <label htmlFor='neverExpires' className='text-sm font-medium text-gray-700'>
                  Never expires
                </label>
              </div>
            )}
          />

          <div className='rounded-md bg-gray-50 p-4'>
            <h3 className='mb-3 text-sm font-medium text-gray-900'>Permissions</h3>
            <div className='space-y-3'>
              <Form.Field
                name='allowCreateBucket'
                children={(field) => (
                  <div className='flex items-center gap-2'>
                    <input
                      id='allowCreateBucket'
                      name={field.name}
                      type='checkbox'
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                      disabled={isSubmitting}
                    />
                    <label htmlFor='allowCreateBucket' className='text-sm text-gray-700'>
                      Allow creating buckets
                    </label>
                  </div>
                )}
              />
            </div>
          </div>

          {/* Actions */}
          <Form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmittingForm]) => (
              <div className='flex justify-end gap-3 pt-2'>
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
                      Updating...
                    </span>
                  ) : (
                    'Update Access Key'
                  )}
                </button>
              </div>
            )}
          />
        </form>
      </div>
    </div>
  )
}
