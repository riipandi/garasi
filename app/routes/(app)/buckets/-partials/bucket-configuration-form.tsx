import * as Lucide from 'lucide-react'
import * as React from 'react'

type SizeUnit = 'MB' | 'GB' | 'TB'

interface BucketConfigurationFormProps {
  websiteAccessEnabled: boolean
  setWebsiteAccessEnabled: (enabled: boolean) => void
  indexDocument: string
  setIndexDocument: (value: string) => void
  errorDocument: string
  setErrorDocument: (value: string) => void
  maxObjects: string
  setMaxObjects: (value: string) => void
  maxSize: string
  setMaxSize: (value: string) => void
  maxSizeUnit: SizeUnit
  setMaxSizeUnit: (unit: SizeUnit) => void
  isPending: boolean
  onSubmit: (e: React.FormEvent) => void
  sizeWarning?: string | null
}

export function BucketConfigurationForm({
  websiteAccessEnabled,
  setWebsiteAccessEnabled,
  indexDocument,
  setIndexDocument,
  errorDocument,
  setErrorDocument,
  maxObjects,
  setMaxObjects,
  maxSize,
  setMaxSize,
  maxSizeUnit,
  setMaxSizeUnit,
  isPending,
  onSubmit,
  sizeWarning
}: BucketConfigurationFormProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Bucket Configuration</h3>
        <p className='text-sm text-gray-500'>Configure website access and storage quotas</p>
      </div>
      <form
        onSubmit={onSubmit}
        className={`space-y-6 px-6 py-4 ${isPending ? 'animate-pulse' : ''}`}
      >
        {/* Website Access Section */}
        <div>
          <div className='mb-4 flex items-center gap-3'>
            <Lucide.Globe className='size-5 text-gray-500' />
            <h3 className='text-base font-semibold text-gray-900'>Website Access</h3>
          </div>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <input
                type='checkbox'
                id='websiteAccessEnabled'
                checked={websiteAccessEnabled}
                onChange={(e) => setWebsiteAccessEnabled(e.target.checked)}
                className='size-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
              />
              <label
                htmlFor='websiteAccessEnabled'
                className='cursor-pointer text-sm font-medium text-gray-700'
              >
                Enable website access for this bucket
              </label>
            </div>

            {websiteAccessEnabled && (
              <div className='mt-4 grid gap-4 sm:grid-cols-2'>
                <div>
                  <label
                    htmlFor='indexDocument'
                    className='mb-2 block text-sm font-medium text-gray-700'
                  >
                    Index Document
                  </label>
                  <input
                    type='text'
                    id='indexDocument'
                    value={indexDocument}
                    onChange={(e) => setIndexDocument(e.target.value)}
                    placeholder='index.html'
                    className='w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    The document to serve when a directory is requested
                  </p>
                </div>

                <div>
                  <label
                    htmlFor='errorDocument'
                    className='mb-2 block text-sm font-medium text-gray-700'
                  >
                    Error Document
                  </label>
                  <input
                    type='text'
                    id='errorDocument'
                    value={errorDocument}
                    onChange={(e) => setErrorDocument(e.target.value)}
                    placeholder='error.html'
                    className='w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                  />
                  <p className='mt-1 text-xs text-gray-500'>
                    The document to serve when an error occurs
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='border-t border-gray-200' />

        {/* Quotas Section */}
        <div>
          <div className='mb-4 flex items-center gap-3'>
            <Lucide.HardDrive className='size-5 text-gray-500' />
            <h3 className='text-base font-semibold text-gray-900'>Storage Quotas</h3>
          </div>
          <div className='space-y-6'>
            {/* Max Objects */}
            <div>
              <label htmlFor='maxObjects' className='mb-2 block text-sm font-medium text-gray-700'>
                Max Objects
              </label>
              <input
                type='number'
                id='maxObjects'
                value={maxObjects}
                onChange={(e) => setMaxObjects(e.target.value)}
                placeholder='Unlimited'
                min='0'
                className='w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              />
              <p className='mt-1 text-xs text-gray-500'>
                Maximum number of objects allowed in this bucket
              </p>
            </div>

            {/* Max Size */}
            <div>
              <label htmlFor='maxSize' className='mb-2 block text-sm font-medium text-gray-700'>
                Max Size
              </label>
              <div className='flex gap-2'>
                <input
                  type='number'
                  id='maxSize'
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  placeholder='Unlimited'
                  min='0'
                  step='any'
                  className='flex-1 rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                />
                <select
                  value={maxSizeUnit}
                  onChange={(e) => setMaxSizeUnit(e.target.value as SizeUnit)}
                  className='rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
                >
                  <option value='MB'>MB</option>
                  <option value='GB'>GB</option>
                  <option value='TB'>TB</option>
                </select>
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Maximum total size of all objects (minimum 100MB)
              </p>
              {sizeWarning && (
                <div className='mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2'>
                  <Lucide.AlertTriangle className='mt-0.5 size-4 flex-shrink-0 text-amber-600' />
                  <p className='text-xs text-amber-800'>{sizeWarning}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex justify-end border-t border-gray-200 pt-4'>
          <button
            type='submit'
            disabled={isPending}
            className={`flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
              isPending ? 'animate-pulse' : ''
            }`}
          >
            {isPending ? (
              <>
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
                Saving...
              </>
            ) : (
              <>
                <Lucide.Save className='size-4' />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
