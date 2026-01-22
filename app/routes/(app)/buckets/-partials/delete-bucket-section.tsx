import * as Lucide from 'lucide-react'

interface DeleteBucketSectionProps {
  onDeleteBucket: () => void
  objectCount: number
}

export function DeleteBucketSection({ onDeleteBucket, objectCount }: DeleteBucketSectionProps) {
  const hasObjects = objectCount > 0

  return (
    <div className='flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <Lucide.AlertTriangle className='mt-0.5 size-5 shrink-0 text-red-600' />
        <div>
          <h3 className='text-base font-semibold text-red-900'>Delete Bucket</h3>
          <p className='text-sm text-red-700'>
            This action cannot be undone and will delete all objects
          </p>
          {hasObjects && (
            <p className='mt-1 text-xs text-red-600'>
              This bucket contains {objectCount} object{objectCount !== 1 ? 's' : ''}. You must
              delete all objects before deleting the bucket.
            </p>
          )}
        </div>
      </div>
      <button
        type='button'
        onClick={onDeleteBucket}
        disabled={hasObjects}
        className={`flex items-center gap-2 rounded-md border border-red-300 px-4 py-2 text-sm font-medium shadow-sm transition-all focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none ${
          hasObjects
            ? 'cursor-not-allowed bg-red-100 text-red-400 opacity-50'
            : 'bg-red-100 text-red-700 hover:bg-red-200'
        }`}
      >
        <Lucide.Trash2 className='size-4' />
        Delete Bucket
      </button>
    </div>
  )
}
