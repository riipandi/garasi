import { queryOptions, useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert } from '~/app/components/alert'
import { ConfirmDialog } from '~/app/components/confirm-dialog'
import { listBuckets, getBucketInfo } from '~/app/services/bucket.service'
import { allowBucketKey, denyBucketKey } from '~/app/services/bucket.service'
import { getKeyInformation, updateAccessKey, deleteAccessKey } from '~/app/services/keys.service'
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
const PermissionsSection = React.lazy(() =>
  import('./-partials/permissions').then((m) => ({ default: m.PermissionsSection }))
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
    queryFn: () => getKeyInformation(keyId, { showSecretKey: 'true' })
  })

const bucketsQuery = queryOptions({
  queryKey: ['buckets'],
  queryFn: () => listBuckets()
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const navigate = useNavigate()
  const [showSecretKey, setShowSecretKey] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
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
      const results = await Promise.all(buckets.map((bucket) => getBucketInfo({ id: bucket.id })))
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
      return allowBucketKey(bucketId, { accessKeyId: id, permissions })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketsWithPermissions', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Bucket access granted successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to grant bucket access')
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
      return denyBucketKey(bucketId, { accessKeyId: id, permissions })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketsWithPermissions', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Bucket access revoked successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to revoke bucket access')
    }
  })

  // Update key mutation
  const updateKeyMutation = useMutation({
    mutationFn: async (values: UpdateAccessKeyRequest) => {
      return updateAccessKey(id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyDetails', id] })
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      setSuccessMessage('Access key updated successfully!')
      setShowEditDialog(false)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update access key')
    }
  })

  // Delete key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async () => {
      return deleteAccessKey(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      setSuccessMessage('Access key deleted successfully!')
      setShowDeleteDialog(false)
      navigate({ to: '/keys' })
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete access key')
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

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    }
  }

  const handleCopySecretKey = () => {
    const secretKey = accessKey?.secretAccessKey || accessKey?.secretKeyId
    if (secretKey) {
      navigator.clipboard.writeText(secretKey)
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

  if (isLoadingKey || !accessKey) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center'>
          <svg className='size-8 animate-spin' fill='none' viewBox='0 0 24 24'>
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
          <p className='mt-4 text-sm text-gray-600'>Loading key details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-screen-2xl space-y-6'>
      {/* Page Header */}
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
              <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>{accessKey.name}</h1>
              {/* Status Badge */}
              {accessKey.deleted ? (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700'>
                  <Lucide.Trash2 className='size-3.5' />
                  Deleted
                </span>
              ) : expired ? (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800'>
                  <Lucide.XCircle className='size-3.5' />
                  Expired
                </span>
              ) : (
                <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800'>
                  <Lucide.CheckCircle2 className='size-3.5' />
                  Active
                </span>
              )}
            </div>
            {/* Action Buttons */}
            <div className='flex items-center gap-2'>
              {/* Edit Button */}
              <button
                type='button'
                onClick={handleEditKey}
                className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
              >
                <Lucide.Edit2 className='size-4' />
                Edit Key
              </button>
              {/* Delete Button */}
              <button
                type='button'
                onClick={handleDeleteKey}
                className='flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-100 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none'
              >
                <Lucide.Trash2 className='size-4' />
                Delete
              </button>
            </div>
          </div>
          <p className='text-normal mt-1 text-sm text-gray-500'>
            Access Key ID: <code className='font-mono'>{accessKey.accessKeyId}</code>
          </p>
        </div>
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

      {/* Key Details */}
      <div className='space-y-5'>
        {/* Key Information Card */}
        <React.Suspense
          fallback={
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
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
            </div>
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

        {/* Permissions Section */}
        {accessKey.permissions && (
          <React.Suspense
            fallback={
              <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
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
              </div>
            }
          >
            <PermissionsSection accessKey={accessKey} />
          </React.Suspense>
        )}

        {/* Bucket Access Section */}
        <React.Suspense
          fallback={
            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
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
            </div>
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
      </div>

      {/* Edit Key Dialog */}
      <KeyEdit
        isOpen={showEditDialog}
        accessKey={accessKey}
        onClose={handleCancelEdit}
        onSubmit={handleUpdateKey}
        isSubmitting={updateKeyMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title='Delete Access Key'
        message={`Are you sure you want to delete the access key "${accessKey.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={deleteKeyMutation.isPending}
      />
    </div>
  )
}
