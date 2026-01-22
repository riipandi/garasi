import * as Lucide from 'lucide-react'
import * as React from 'react'
import type { Bucket, UpdateBucketRequest } from './types'

interface BucketEditProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: UpdateBucketRequest) => void
  isSubmitting: boolean
  bucket: Bucket | null
}

export function BucketEdit({ isOpen, onClose, onSubmit, isSubmitting, bucket }: BucketEditProps) {
  const [websiteAccessEnabled, setWebsiteAccessEnabled] = React.useState(false)
  const [indexDocument, setIndexDocument] = React.useState('')
  const [errorDocument, setErrorDocument] = React.useState('')
  const [maxObjects, setMaxObjects] = React.useState<string>('')
  const [maxSize, setMaxSize] = React.useState<string>('')

  // Initialize form with bucket data
  React.useEffect(() => {
    if (bucket) {
      setWebsiteAccessEnabled(bucket.websiteAccess)
      setIndexDocument(bucket.websiteConfig?.indexDocument || '')
      setErrorDocument(bucket.websiteConfig?.errorDocument || '')
      setMaxObjects(bucket.quotas.maxObjects?.toString() || '')
      setMaxSize(bucket.quotas.maxSize?.toString() || '')
    }
  }, [bucket])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const values: UpdateBucketRequest = {}

    // Website access configuration
    if (websiteAccessEnabled || indexDocument || errorDocument) {
      values.websiteAccess = {
        enabled: websiteAccessEnabled,
        indexDocument: indexDocument || null,
        errorDocument: errorDocument || null
      }
    }

    // Quotas configuration
    if (maxObjects || maxSize) {
      values.quotas = {
        maxObjects: maxObjects ? parseInt(maxObjects, 10) : null,
        maxSize: maxSize ? parseInt(maxSize, 10) : null
      }
    }

    onSubmit(values)
  }

  const handleClose = () => {
    setWebsiteAccessEnabled(false)
    setIndexDocument('')
    setErrorDocument('')
    setMaxObjects('')
    setMaxSize('')
    onClose()
  }

  if (!isOpen || !bucket) return null

  return (
    <div className='animate-in zoom-in-95 fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm duration-200'>
      <div className='animate-in zoom-in-95 fade-in mx-4 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg duration-200'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>Edit Bucket</h2>
          <button type='button' onClick={handleClose} className='text-gray-400 hover:text-gray-500'>
            <Lucide.X className='size-6' />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className={`space-y-6 ${isSubmitting ? 'animate-pulse' : ''}`}
        >
          {/* Website Access Section */}
          <div className='rounded-md border border-gray-200 p-4'>
            <h3 className='mb-3 text-sm font-medium text-gray-900'>Website Access</h3>
            <div className='space-y-3'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={websiteAccessEnabled}
                  onChange={(e) => setWebsiteAccessEnabled(e.target.checked)}
                  className='mr-2'
                />
                <span className='text-sm text-gray-700'>Enable Website Access</span>
              </label>

              {websiteAccessEnabled && (
                <>
                  <div>
                    <label
                      htmlFor='indexDocument'
                      className='mb-1 block text-sm font-medium text-gray-700'
                    >
                      Index Document
                    </label>
                    <input
                      type='text'
                      id='indexDocument'
                      value={indexDocument}
                      onChange={(e) => setIndexDocument(e.target.value)}
                      placeholder='index.html'
                      className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      The default document served for the root URL (e.g., index.html)
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor='errorDocument'
                      className='mb-1 block text-sm font-medium text-gray-700'
                    >
                      Error Document
                    </label>
                    <input
                      type='text'
                      id='errorDocument'
                      value={errorDocument}
                      onChange={(e) => setErrorDocument(e.target.value)}
                      placeholder='error.html'
                      className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                    />
                    <p className='mt-1 text-xs text-gray-500'>
                      The document served for 4xx errors (e.g., error.html)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quotas Section */}
          <div className='rounded-md border border-gray-200 p-4'>
            <h3 className='mb-3 text-sm font-medium text-gray-900'>Quotas</h3>
            <div className='space-y-3'>
              <div>
                <label
                  htmlFor='maxObjects'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  Max Objects
                </label>
                <input
                  type='number'
                  id='maxObjects'
                  value={maxObjects}
                  onChange={(e) => setMaxObjects(e.target.value)}
                  placeholder='Unlimited'
                  min='0'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Maximum number of objects allowed in the bucket (leave empty for unlimited)
                </p>
              </div>

              <div>
                <label htmlFor='maxSize' className='mb-1 block text-sm font-medium text-gray-700'>
                  Max Size (bytes)
                </label>
                <input
                  type='number'
                  id='maxSize'
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder='Unlimited'
                  min='0'
                  className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                />
                <p className='mt-1 text-xs text-gray-500'>
                  Maximum size in bytes allowed in the bucket (leave empty for unlimited)
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4'>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className={`rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                isSubmitting ? 'animate-pulse' : ''
              }`}
            >
              {isSubmitting ? (
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
                'Update Bucket'
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className='mt-4 rounded-md border border-blue-200 bg-blue-50 p-3'>
          <div className='flex gap-2'>
            <Lucide.Info className='mt-0.5 size-4 shrink-0 text-blue-600' />
            <p className='text-xs text-blue-700'>
              Website access allows you to host static websites from your bucket. Quotas help you
              control resource usage by setting limits on objects and storage size.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
