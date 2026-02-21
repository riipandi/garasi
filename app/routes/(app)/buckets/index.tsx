import { queryOptions, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert, AlertDescription } from '~/app/components/alert'
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogClose,
  AlertDialogPopup,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '~/app/components/alert-dialog'
import { Button } from '~/app/components/button'
import { toast } from '~/app/components/toast'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import bucketService from '~/app/services/bucket.service'
import type { CreateBucketRequest } from '~/shared/schemas/bucket.schema'
import { BucketCreate } from './-partials/bucket-create'
import { BucketTable } from './-partials/bucket-table'

const bucketsQueryOpts = queryOptions({
  queryKey: ['buckets'],
  queryFn: () => bucketService.listBuckets()
})

export const Route = createFileRoute('/(app)/buckets/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(bucketsQueryOpts)
  }
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [bucketToDelete, setBucketToDelete] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const { data: bucketsResponse } = useSuspenseQuery(bucketsQueryOpts)
  const buckets = bucketsResponse?.data ?? []

  const createBucketMutation = useMutation({
    mutationFn: async (values: CreateBucketRequest) => {
      return bucketService.createBucket(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Bucket created successfully', type: 'success' })
      setShowCreateDialog(false)
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create bucket'
      toast.add({ title: 'Creation failed', description: errorMsg, type: 'error' })
    }
  })

  const deleteBucketMutation = useMutation({
    mutationFn: async (bucketId: string) => {
      return bucketService.deleteBucket(bucketId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Bucket deleted successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete bucket'
      toast.add({ title: 'Deletion failed', description: errorMsg, type: 'error' })
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

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Buckets
        </Heading>
        <Text className='text-muted'>Manage your S3 buckets</Text>
      </div>

      <div className='flex flex-wrap gap-2.5'>
        <Button onClick={handleShowCreateDialog}>
          <Lucide.Plus className='size-4' />
          Create Bucket
        </Button>
        <Button
          variant='outline'
          onClick={handleRefreshBuckets}
          disabled={isRefreshing}
          progress={isRefreshing}
        >
          <Lucide.RefreshCw className='size-4' />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <BucketTable buckets={buckets} onDelete={handleDeleteBucket} isLoading={isRefreshing} />

      <Alert variant='info'>
        <Lucide.Info className='size-4' />
        <AlertDescription>
          Buckets are containers for objects stored in Garage. Each bucket can have global aliases
          (accessible by all keys) or local aliases (accessible only by specific keys). Click on a
          bucket ID to view details and manage its settings.
        </AlertDescription>
      </Alert>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete this bucket? This action cannot be undone and will
              permanently remove the bucket and all its contents.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={handleConfirmDelete}
                  disabled={deleteBucketMutation.isPending}
                  progress={deleteBucketMutation.isPending}
                >
                  {deleteBucketMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <BucketCreate
        isOpen={showCreateDialog}
        onClose={handleCancelCreateDialog}
        onSubmit={handleCreateBucket}
        isSubmitting={createBucketMutation.isPending}
      />
    </div>
  )
}
