import { useForm } from '@tanstack/react-form'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { z } from 'zod'

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
  }, [isOpen, onClose])

  React.useEffect(() => {
    if (isOpen) {
      Form.reset()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm'>
      <div className='animate-in zoom-in-95 fade-in w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg duration-200'>
        {/* Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100'>
              <Lucide.Globe className='size-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Add Global Alias</h2>
              <p className='text-sm text-gray-600'>Add a global alias to this bucket</p>
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
            children={(field) => (
              <div>
                <label htmlFor='globalAlias' className='block text-sm font-medium text-gray-700'>
                  Global Alias <span className='text-red-500'>*</span>
                </label>
                <input
                  id='globalAlias'
                  name={field.name}
                  type='text'
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder='my-bucket-alias'
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
                  disabled={isSubmitting}
                  autoFocus
                />
                {field.state.meta.errors[0] && (
                  <p className='mt-1 text-xs text-red-600'>{String(field.state.meta.errors[0])}</p>
                )}
              </div>
            )}
          />

          {/* Info Box */}
          <div className='mt-4 rounded-md border border-blue-200 bg-blue-50 p-3'>
            <div className='flex gap-2'>
              <Lucide.Info className='mt-0.5 size-4 shrink-0 text-blue-600' />
              <p className='text-xs text-blue-700'>
                Global aliases are accessible by all keys. Use lowercase letters, numbers, and
                dashes only.
              </p>
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
                      Adding...
                    </span>
                  ) : (
                    'Add Alias'
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
