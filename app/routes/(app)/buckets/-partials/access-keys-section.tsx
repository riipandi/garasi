import * as Lucide from 'lucide-react'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

interface AccessKeysSectionProps {
  bucket: GetBucketInfoResponse
  onShowKeySelectorDialog: () => void
  onViewKey: (accessKeyId: string) => void
  onDeleteKey: (accessKeyId: string) => void
}

export function AccessKeysSection({
  bucket,
  onShowKeySelectorDialog,
  onViewKey,
  onDeleteKey
}: AccessKeysSectionProps) {
  const keys = Array.isArray(bucket.keys) ? bucket.keys : []
  const hasKeys = keys.length > 0

  return (
    <div className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='border-b border-gray-200 px-6 py-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Access Keys</h3>
        <p className='text-sm text-gray-500'>Manage access keys that can access this bucket</p>
      </div>
      <div className='p-6'>
        {hasKeys ? (
          <div className='flex flex-col gap-3'>
            {keys.map((key) => (
              <div
                key={key.accessKeyId}
                className='flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm'
              >
                <div className='flex items-center gap-3'>
                  <Lucide.Lock className='size-4 text-gray-600' />
                  <div>
                    <span className='text-sm font-medium text-gray-900'>{key.name}</span>
                    <span className='ml-2 text-sm text-gray-500'>({key.accessKeyId})</span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex flex-wrap gap-2'>
                    {key.permissions.owner && (
                      <span className='inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800'>
                        Owner
                      </span>
                    )}
                    {key.permissions.read && (
                      <span className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
                        Read
                      </span>
                    )}
                    {key.permissions.write && (
                      <span className='inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                        Write
                      </span>
                    )}
                  </div>
                  <div className='ml-4 flex items-center gap-2 border-l border-gray-200 pl-4'>
                    <button
                      type='button'
                      onClick={() => onViewKey(key.accessKeyId)}
                      className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100 focus:outline-none'
                    >
                      <Lucide.Eye className='size-4' />
                      View Key
                    </button>
                    <button
                      type='button'
                      onClick={() => onDeleteKey(key.accessKeyId)}
                      className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 focus:outline-none'
                    >
                      <Lucide.Trash2 className='size-4' />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex items-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-4'>
            <Lucide.Lock className='size-6 shrink-0 text-gray-400' />
            <div className='flex-1'>
              <p className='text-sm font-medium text-gray-700'>
                No access keys have access to this bucket.
              </p>
              <p className='text-sm text-gray-500'>
                Keys that have access to this bucket will appear here.
              </p>
            </div>
            <button
              type='button'
              onClick={onShowKeySelectorDialog}
              className='flex shrink-0 items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Plus className='size-4' />
              Assign Key
            </button>
          </div>
        )}

        {/* Assign Key Button (shown when there are keys) */}
        {hasKeys && (
          <div className='mt-4 flex justify-end border-t border-gray-200 pt-4'>
            <button
              type='button'
              onClick={onShowKeySelectorDialog}
              className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Plus className='size-4' />
              Assign Key
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
