import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'
import type { ImportKeyRequest } from './types'

interface KeyImportProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: ImportKeyRequest) => Promise<void>
  isSubmitting?: boolean
}

const importKeySchema = z.object({
  accessKeyId: z.string().min(1, 'Access Key ID is required'),
  secretKeyId: z.string().min(1, 'Secret Key ID is required'),
  name: z.string().max(100, 'Name must be less than 100 characters').optional()
})

export function KeyImport({ isOpen, onClose, onSubmit, isSubmitting }: KeyImportProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const Form = useForm({
    defaultValues: {
      accessKeyId: '',
      secretKeyId: '',
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
        secretKeyId: value.secretKeyId,
        name: value.name || null
      })
    }
  })

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='animate-in fade-in zoom-in-95 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-4 shadow-lg duration-200 sm:p-6'>
        <div className='mb-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-gray-900 sm:text-xl'>Import Access Key</h2>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              aria-label='Close dialog'
            >
              <Lucide.X className='size-5' />
            </button>
          </div>
          <p className='text-normal mt-2 text-gray-500'>
            Import an existing access key from another Garage instance
          </p>
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
                <label htmlFor='accessKeyId' className='block text-sm font-medium text-gray-700'>
                  Access Key ID <span className='text-red-500'>*</span>
                </label>
                <input
                  id='accessKeyId'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='e.g., GK1234567890abcdef'
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isSubmitting}
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          <Form.Field
            name='secretKeyId'
            validators={{
              onChange: ({ value }) => {
                const result = importKeySchema.shape.secretKeyId.safeParse(value)
                if (!result.success) {
                  const firstError = result.error.issues[0]
                  return firstError ? firstError.message : undefined
                }
                return undefined
              }
            }}
            children={(field) => (
              <div>
                <label htmlFor='secretKeyId' className='block text-sm font-medium text-gray-700'>
                  Secret Key ID <span className='text-red-500'>*</span>
                </label>
                <input
                  id='secretKeyId'
                  name={field.name}
                  type='password'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='e.g., abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
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
                <label htmlFor='name' className='block text-sm font-medium text-gray-700'>
                  Name (optional)
                </label>
                <input
                  id='name'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='e.g., Imported Key from Production'
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
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmittingForm]) => (
              <div className='flex justify-end gap-3'>
                <button
                  type='button'
                  onClick={onClose}
                  className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
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
                      Importing...
                    </span>
                  ) : (
                    'Import Key'
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
