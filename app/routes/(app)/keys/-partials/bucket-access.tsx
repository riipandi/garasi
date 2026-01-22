import * as Lucide from 'lucide-react'

interface BucketPermission {
  read: boolean
  write: boolean
  owner: boolean
}

interface BucketAccessSectionProps {
  buckets: Array<{ id: string; created: string; globalAliases: string[] }>
  selectedBuckets: Set<string>
  bucketPermissions: Record<string, BucketPermission>
  isLoadingPermissions: boolean
  isLoadingBuckets: boolean
  isSaving: boolean
  onBucketToggle: (bucketId: string) => void
  onPermissionChange: (bucketId: string, permission: keyof BucketPermission, value: boolean) => void
  onSavePermissions: () => void
}

export function BucketAccessSection({
  buckets,
  selectedBuckets,
  bucketPermissions,
  isLoadingPermissions,
  isLoadingBuckets,
  isSaving,
  onBucketToggle,
  onPermissionChange,
  onSavePermissions
}: BucketAccessSectionProps) {
  return (
    <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='flex items-center gap-2 text-sm font-semibold text-gray-900'>
          <Lucide.Database className='size-4 text-blue-600' />
          Bucket Access
        </h3>
        <button
          type='button'
          onClick={onSavePermissions}
          disabled={isSaving || isLoadingPermissions}
          className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isSaving ? (
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

      <p className='mb-4 text-sm text-gray-600'>
        Select buckets you'd like to give this access key permission to access.
      </p>

      {isLoadingPermissions || isLoadingBuckets ? (
        <div className='flex items-center justify-center py-8'>
          <svg className='size-6 animate-spin' fill='none' viewBox='0 0 24 24'>
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
        </div>
      ) : buckets.length === 0 ? (
        <div className='rounded-md border border-dashed border-gray-300 bg-white p-8 text-center'>
          <Lucide.Database className='mx-auto mb-4 size-12 text-gray-400' />
          <h4 className='text-base font-medium text-gray-900'>No buckets found</h4>
          <p className='mt-2 text-sm text-gray-500'>
            Create a bucket first to assign access permissions.
          </p>
        </div>
      ) : (
        <div className='space-y-3'>
          {buckets.map((bucket) => {
            const isSelected = selectedBuckets.has(bucket.id)
            const permissions = bucketPermissions[bucket.id] || {
              read: true,
              write: false,
              owner: false
            }

            return (
              <div
                key={bucket.id}
                className={`rounded-md border bg-white p-4 shadow-sm transition-all ${
                  isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        id={`bucket-${bucket.id}`}
                        checked={isSelected}
                        onChange={() => onBucketToggle(bucket.id)}
                        className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none'
                      />
                      <label htmlFor={`bucket-${bucket.id}`} className='flex-1 cursor-pointer'>
                        <div className='flex items-center gap-2'>
                          <span className='font-mono text-sm font-medium text-gray-900'>
                            {bucket.id}
                          </span>
                          {bucket.globalAliases.length > 0 && (
                            <div className='flex gap-1'>
                              {bucket.globalAliases.map((alias) => (
                                <span
                                  key={alias}
                                  className='inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800'
                                >
                                  <Lucide.Globe className='mr-1 size-3' />
                                  {alias}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </label>
                    </div>

                    {isSelected && (
                      <div className='mt-3 ml-7 space-y-2'>
                        <p className='text-xs text-gray-600'>Permissions:</p>
                        <div className='flex flex-wrap gap-3'>
                          <label className='flex items-center gap-2 text-sm text-gray-700'>
                            <input
                              type='checkbox'
                              checked={permissions.read}
                              onChange={(e) =>
                                onPermissionChange(bucket.id, 'read', e.target.checked)
                              }
                              className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none'
                            />
                            <span>Read</span>
                          </label>
                          <label className='flex items-center gap-2 text-sm text-gray-700'>
                            <input
                              type='checkbox'
                              checked={permissions.write}
                              onChange={(e) =>
                                onPermissionChange(bucket.id, 'write', e.target.checked)
                              }
                              className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none'
                            />
                            <span>Write</span>
                          </label>
                          <label className='flex items-center gap-2 text-sm text-gray-700'>
                            <input
                              type='checkbox'
                              checked={permissions.owner}
                              onChange={(e) =>
                                onPermissionChange(bucket.id, 'owner', e.target.checked)
                              }
                              className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:outline-none'
                            />
                            <span>Owner</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
