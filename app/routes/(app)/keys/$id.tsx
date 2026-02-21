import { queryOptions, useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
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
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody } from '~/app/components/card'
import { Spinner } from '~/app/components/spinner'
import { toast } from '~/app/components/toast'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import bucketService from '~/app/services/bucket.service'
import keysService from '~/app/services/keys.service'
import type { ApiBucketKeyPerm } from '~/shared/schemas/bucket.schema'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyRequest } from '~/shared/schemas/keys.schema'
import { KeyEdit } from './-partials/key-edit'

// Extend the schema type with additional properties needed by the UI
interface AccessKey extends GetKeyInformationResponse {
  deleted?: boolean
  neverExpires?: boolean
  secretKeyId?: string
}

// Lazy load components for code splitting
const KeyInformationCard = React.lazy(() =>
  import('./-partials/key-information-card').then((m) => ({ default: m.KeyInformationCard }))
)
const BucketAccessSection = React.lazy(() =>
  import('./-partials/bucket-access').then((m) => ({ default: m.BucketAccessSection }))
)

export const Route = createFileRoute('/(app)/keys/$id')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(keyDetailsQuery(params.id))
    context.queryClient.ensureQueryData(bucketsQuery)
  }
})

const keyDetailsQuery = (keyId: string) =>
  queryOptions({
    queryKey: ['keyDetails', keyId],
    queryFn: () => keysService.getKeyInformation(keyId, { showSecretKey: 'true' })
  })

const bucketsQuery = queryOptions({
  queryKey: ['buckets'],
  queryFn: () => bucketService.listBuckets()
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const navigate = useNavigate()
  const [showSecretKey, setShowSecretKey] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [selectedBuckets, setSelectedBuckets] = React.useState<Set<string>>(new Set())
  const [bucketPermissions, setBucketPermissions] = React.useState<
    Record<string, ApiBucketKeyPerm>
  >({})

  // Fetch key details with secret
  const { data: keyData, isLoading: isLoadingKey } = useSuspenseQuery(keyDetailsQuery(id))
  const accessKey = (keyData?.data as AccessKey) || null

  // Fetch buckets
  const { data: bucketsData, isLoading: isLoadingBuckets } = useSuspenseQuery(bucketsQuery)
  const buckets = bucketsData?.data || []

  // Fetch bucket details for each bucket to get key permissions
  const { data: bucketsWithPermissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ['bucketsWithPermissions', id],
    queryFn: async () => {
      const results = await Promise.all(
        buckets.map((bucket) => bucketService.getBucketInfo({ id: bucket.id }))
      )
      return results.map((r) => r.data)
    },
    enabled: buckets.length > 0
  })

  // Allow bucket key mutation
  const allowBucketKeyMutation = useMutation({
    mutationFn: async ({
      bucketId,
      permissions
    }: {
      bucketId: string
      permissions: ApiBucketKeyPerm
    }) => {
      return bucketService.allowBucketKey(bucketId, { accessKeyId: id, permissions })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketsWithPermissions', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Bucket access granted', type: 'success' })
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to grant bucket access',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      })
    }
  })

  // Deny bucket key mutation
  const denyBucketKeyMutation = useMutation({
    mutationFn: async ({
      bucketId,
      permissions
    }: {
      bucketId: string
      permissions: ApiBucketKeyPerm
    }) => {
      return bucketService.denyBucketKey(bucketId, { accessKeyId: id, permissions })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketsWithPermissions', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Bucket access revoked', type: 'success' })
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to revoke bucket access',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      })
    }
  })

  // Update key mutation
  const updateKeyMutation = useMutation({
    mutationFn: async (values: UpdateAccessKeyRequest) => {
      return keysService.updateAccessKey(id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      toast.add({ title: 'Access key updated', type: 'success' })
      setShowEditDialog(false)
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to update access key',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      })
    }
  })

  // Delete key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async () => {
      return keysService.deleteAccessKey(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      toast.add({ title: 'Access key deleted', type: 'success' })
      setShowDeleteDialog(false)
      navigate({ to: '/keys' })
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to delete access key',
        description: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      })
    }
  })

  // Initialize bucket permissions when data loads
  React.useEffect(() => {
    if (bucketsWithPermissions) {
      const permissions: Record<string, ApiBucketKeyPerm> = {}
      const selected: Set<string> = new Set()

      bucketsWithPermissions.forEach((bucket) => {
        if (bucket) {
          const keyPermission = bucket.keys?.find((k) => k.accessKeyId === id)
          if (keyPermission) {
            permissions[bucket.id] = keyPermission.permissions
            selected.add(bucket.id)
          }
        }
      })

      setBucketPermissions(permissions)
      setSelectedBuckets(selected)
    }
  }, [bucketsWithPermissions, id])

  const handleBucketToggle = (bucketId: string) => {
    setSelectedBuckets((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(bucketId)) {
        newSet.delete(bucketId)
      } else {
        newSet.add(bucketId)
      }
      return newSet
    })
  }

  const handlePermissionChange = (
    bucketId: string,
    permission: keyof ApiBucketKeyPerm,
    value: boolean
  ) => {
    setBucketPermissions((prev) => {
      const current = prev[bucketId] || { read: true, write: false, owner: false }
      return {
        ...prev,
        [bucketId]: {
          ...current,
          [permission]: value
        }
      }
    })
  }

  const handleSavePermissions = async () => {
    // Process each bucket
    for (const bucketId of selectedBuckets) {
      const permissions = bucketPermissions[bucketId] || { read: true, write: false, owner: false }
      await allowBucketKeyMutation.mutateAsync({ bucketId, permissions })
    }

    // Revoke access for unselected buckets
    for (const bucket of buckets) {
      const permissions = bucketPermissions[bucket.id]
      if (!selectedBuckets.has(bucket.id) && permissions) {
        await denyBucketKeyMutation.mutateAsync({
          bucketId: bucket.id,
          permissions
        })
      }
    }
  }

  const handleEditKey = () => {
    setShowEditDialog(true)
  }

  const handleUpdateKey = async (values: UpdateAccessKeyRequest) => {
    await updateKeyMutation.mutateAsync(values)
  }

  const handleCancelEdit = () => {
    setShowEditDialog(false)
  }

  const handleDeleteKey = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    await deleteKeyMutation.mutateAsync()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatExpiration = (expiration: string | null, neverExpires: boolean = false) => {
    if (neverExpires) return 'Never'
    if (!expiration) return 'N/A'
    const date = new Date(expiration)
    const now = new Date()
    if (date < now) return 'Expired'
    return formatDate(expiration)
  }

  const isExpired = (
    expiration: string | null,
    neverExpires: boolean = false,
    expired?: boolean
  ) => {
    if (expired !== undefined) return expired
    if (neverExpires) return false
    if (!expiration) return false
    return new Date(expiration) < new Date()
  }

  const expired = isExpired(
    accessKey?.expiration || null,
    accessKey?.neverExpires || false,
    accessKey?.expired
  )

  const handleCopyAccessKey = () => {
    if (accessKey?.accessKeyId) {
      navigator.clipboard.writeText(accessKey.accessKeyId)
      toast.add({ title: 'Access Key ID copied', type: 'success' })
    }
  }

  const handleCopySecretKey = () => {
    const secretKey = accessKey?.secretAccessKey || accessKey?.secretKeyId
    if (secretKey) {
      navigator.clipboard.writeText(secretKey)
      toast.add({ title: 'Secret Key copied', type: 'success' })
    }
  }

  if (isLoadingKey || !accessKey) {
    return (
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='flex flex-col items-center'>
          <Spinner />
          <Text className='mt-4 text-sm text-gray-600'>Loading key details...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <div className='flex items-start gap-4'>
        <Link
          to='/keys'
          className='rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
        >
          <Lucide.ArrowLeft className='size-5' />
        </Link>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <Heading level={1} size='lg'>
                {accessKey.name}
              </Heading>
              {accessKey.deleted ? (
                <Badge variant='secondary' pill className='px-3 py-1'>
                  <Lucide.Trash2 className='size-3.5' aria-hidden='true' />
                  Deleted
                </Badge>
              ) : expired ? (
                <Badge variant='danger' pill className='px-3 py-1'>
                  <Lucide.XCircle className='size-3.5' aria-hidden='true' />
                  Expired
                </Badge>
              ) : (
                <Badge variant='success' pill className='px-3 py-1'>
                  <Lucide.CheckCircle2 className='size-3.5' aria-hidden='true' />
                  Active
                </Badge>
              )}
            </div>
            <div className='flex items-center gap-4'>
              <Button variant='outline' onClick={handleEditKey}>
                <Lucide.Edit2 className='size-4' />
                Edit Key
              </Button>
              <Button variant='danger' onClick={handleDeleteKey}>
                <Lucide.Trash2 className='size-4' />
                Delete
              </Button>
            </div>
          </div>
          <Text className='text-normal mt-1 text-sm text-gray-500'>
            Access Key ID: <code className='font-mono'>{accessKey.accessKeyId}</code>
          </Text>
        </div>
      </div>

      <React.Suspense
        fallback={
          <Card>
            <CardBody className='flex items-center justify-center py-8'>
              <Spinner />
            </CardBody>
          </Card>
        }
      >
        <KeyInformationCard
          accessKey={accessKey}
          showSecretKey={showSecretKey}
          onToggleSecretKey={() => setShowSecretKey(!showSecretKey)}
          onCopyAccessKey={handleCopyAccessKey}
          onCopySecretKey={handleCopySecretKey}
          formatDate={formatDate}
          formatExpiration={formatExpiration}
          expired={expired}
        />
      </React.Suspense>

      <React.Suspense
        fallback={
          <Card>
            <CardBody className='flex items-center justify-center py-8'>
              <Spinner />
            </CardBody>
          </Card>
        }
      >
        <BucketAccessSection
          buckets={buckets}
          selectedBuckets={selectedBuckets}
          bucketPermissions={bucketPermissions}
          isLoadingPermissions={isLoadingPermissions}
          isLoadingBuckets={isLoadingBuckets}
          isSaving={allowBucketKeyMutation.isPending || denyBucketKeyMutation.isPending}
          onBucketToggle={handleBucketToggle}
          onPermissionChange={handlePermissionChange}
          onSavePermissions={handleSavePermissions}
        />
      </React.Suspense>

      {/* Edit Key Dialog */}
      <KeyEdit
        isOpen={showEditDialog}
        accessKey={accessKey}
        onClose={handleCancelEdit}
        onSubmit={handleUpdateKey}
        isSubmitting={updateKeyMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Access Key</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete the access key "{accessKey.name}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={handleConfirmDelete}
                  disabled={deleteKeyMutation.isPending}
                >
                  {deleteKeyMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  )
}
