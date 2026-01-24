import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert } from '~/app/components/alert'
import { ConfirmDialog } from '~/app/components/confirm-dialog'
import { createBucket, deleteBucket } from '~/app/services'
import { listBuckets } from '~/app/services/bucket.service'
import { BucketCreate } from './-partials/bucket-create'
import { BucketTable } from './-partials/bucket-table'
import type { CreateBucketRequest } from './-partials/types'

export const Route = createFileRoute('/(app)/buckets/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(listBuckets().queryOpts)
  }
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [bucketToDelete, setBucketToDelete] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Fetch buckets
  const { data: bucketsResponse } = useSuspenseQuery(listBuckets().queryOpts)
  const buckets = bucketsResponse?.data ?? []

  // Create bucket mutation
  const createBucketMutation = useMutation({
    mutationFn: async (values: CreateBucketRequest) => {
      return createBucket(values.globalAlias, values.localAlias)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listBuckets().queryKey })
      setSuccessMessage('Bucket created successfully!')
      setShowCreateDialog(false)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create bucket')
    }
  })

  // Delete bucket mutation
  const deleteBucketMutation = useMutation({
    mutationFn: async (bucketId: string) => {
      return deleteBucket(bucketId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Bucket deleted successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete bucket')
    }
  })

  const handleDeleteBucket = (bucketId: string) => {
    setBucketToDelete(bucketId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (bucketToDelete) {
      await deleteBucketMutation.mutateAsync(bucketToDelete)
      setShowDeleteConfirm(false)
      setBucketToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setBucketToDelete(null)
  }

  const handleCreateBucket = async (values: CreateBucketRequest) => {
    await createBucketMutation.mutateAsync(values)
  }

  const handleShowCreateDialog = () => {
    setShowCreateDialog(true)
  }

  const handleCancelCreateDialog = () => {
    setShowCreateDialog(false)
  }

  const handleRefreshBuckets = async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: ['buckets'] })
    } finally {
      setIsRefreshing(false)
    }
  }

  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [successMessage])

  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [errorMessage])

  return (
    <div className='mx-auto w-full max-w-screen-2xl space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Buckets</h1>
        <p className='text-normal mt-2 text-gray-500'>Manage your S3 buckets</p>
      </div>

      {/* Page Content */}
      <div className='min-w-0 flex-1'>
        <div className='space-y-4'>
          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={handleShowCreateDialog}
              className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Plus className='size-4' />
              Create Bucket
            </button>
            <button
              type='button'
              onClick={handleRefreshBuckets}
              disabled={isRefreshing}
              className={`flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                isRefreshing ? 'animate-pulse' : ''
              }`}
            >
              {isRefreshing ? (
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
              ) : (
                <Lucide.RefreshCw className='size-4' />
              )}
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Alerts */}
          {successMessage && (
            <div className='mx-auto w-full'>
              <Alert type='success'>{successMessage}</Alert>
            </div>
          )}
          {errorMessage && (
            <div className='mx-auto w-full'>
              <Alert type='error'>{errorMessage}</Alert>
            </div>
          )}

          {/* Bucket List */}
          <BucketTable buckets={buckets} onDelete={handleDeleteBucket} isLoading={isRefreshing} />

          {/* Info Box */}
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <div className='flex gap-3'>
              <Lucide.Info className='mt-0.5 size-5 shrink-0 text-blue-600' />
              <div>
                <h4 className='text-sm font-medium text-blue-900'>Information</h4>
                <p className='mt-1 text-xs text-blue-700'>
                  Buckets are containers for objects stored in Garage. Each bucket can have global
                  aliases (accessible by all keys) or local aliases (accessible only by specific
                  keys). Click on a bucket ID to view details and manage its settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title='Delete Bucket'
        message='Are you sure you want to delete this bucket? This action cannot be undone and will permanently remove the bucket and all its contents.'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={deleteBucketMutation.isPending}
      />

      {/* Bucket Create Dialog */}
      <BucketCreate
        isOpen={showCreateDialog}
        onClose={handleCancelCreateDialog}
        onSubmit={handleCreateBucket}
        isSubmitting={createBucketMutation.isPending}
      />
    </div>
  )
}
