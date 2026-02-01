import { queryOptions, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert } from '~/app/components/alert'
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
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import { createBucket, deleteBucket, listBuckets } from '~/app/services/bucket.service'
import type { CreateBucketRequest } from '~/shared/schemas/bucket.schema'
import { BucketCreate } from './-partials/bucket-create'
import { BucketTable } from './-partials/bucket-table'

const bucketsQueryOpts = queryOptions({
  queryKey: ['buckets'],
  queryFn: () => listBuckets()
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
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const { data: bucketsResponse } = useSuspenseQuery(bucketsQueryOpts)
  const buckets = bucketsResponse?.data ?? []

  const createBucketMutation = useMutation({
    mutationFn: async (values: CreateBucketRequest) => {
      return createBucket(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Bucket created successfully!')
      setShowCreateDialog(false)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create bucket')
    }
  })

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
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Buckets
        </Heading>
        <Text className='text-muted'>Manage your S3 buckets</Text>
      </div>

      <Stack>
        <div className='flex flex-wrap gap-2'>
          <Button variant='primary' onClick={handleShowCreateDialog}>
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

        {successMessage && <Alert variant='success'>{successMessage}</Alert>}
        {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}

        <BucketTable buckets={buckets} onDelete={handleDeleteBucket} isLoading={isRefreshing} />

        <Alert>
          <Lucide.Info className='size-5' />
          <Stack>
            <Heading level={4} size='sm'>
              Information
            </Heading>
            <Text>
              Buckets are containers for objects stored in Garage. Each bucket can have global
              aliases (accessible by all keys) or local aliases (accessible only by specific keys).
              Click on a bucket ID to view details and manage its settings.
            </Text>
          </Stack>
        </Alert>
      </Stack>

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
