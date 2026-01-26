import { queryOptions, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { ConfirmDialog } from '~/app/components/confirm-dialog'
import { Alert } from '~/app/components/selia/alert'
import { addBucketAlias, removeBucketAlias } from '~/app/services/bucket.service'
import { updateBucket, deleteBucket, getBucketInfo } from '~/app/services/bucket.service'
import { allowBucketKey, denyBucketKey } from '~/app/services/bucket.service'
import type { UpdateBucketRequest } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketLocalAliasRequest } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketGlobalAliasRequest } from '~/shared/schemas/bucket.schema'
import type { AllowBucketKeyRequest, DenyBucketKeyRequest } from '~/shared/schemas/bucket.schema'
import type { AddGlobalBucketAliasRequest } from '~/shared/schemas/bucket.schema'
import type { AddLocalBucketAliasRequest } from '~/shared/schemas/bucket.schema'
import { AccessKeysSection } from './-partials/access-keys-section'
import { AddGlobalAlias } from './-partials/add-global-alias'
import { AddLocalAlias } from './-partials/add-local-alias'
import { AliasesSection } from './-partials/aliases-section'
import { BucketConfigurationForm } from './-partials/bucket-configuration-form'
import { DeleteBucketSection } from './-partials/delete-bucket-section'
import { KeySelectorDialog } from './-partials/key-selector-dialog'

type SizeUnit = 'MB' | 'GB' | 'TB'

// Conversion utilities
const BYTES_PER_MB = 1024 * 1024
const BYTES_PER_GB = 1024 * 1024 * 1024
const BYTES_PER_TB = 1024 * 1024 * 1024 * 1024

function bytesToSizeUnit(bytes: number | null | undefined): { value: string; unit: SizeUnit } {
  if (!bytes || bytes === 0) {
    return { value: '', unit: 'GB' }
  }

  // Determine the best unit to use
  if (bytes >= BYTES_PER_TB) {
    return { value: (bytes / BYTES_PER_TB).toString(), unit: 'TB' }
  } else if (bytes >= BYTES_PER_GB) {
    return { value: (bytes / BYTES_PER_GB).toString(), unit: 'GB' }
  } else {
    return { value: (bytes / BYTES_PER_MB).toString(), unit: 'MB' }
  }
}

function sizeUnitToBytes(value: string, unit: SizeUnit): number | null {
  if (!value || value === '') {
    return null
  }

  const numValue = parseFloat(value)
  if (isNaN(numValue) || numValue < 0) {
    return null
  }

  switch (unit) {
    case 'MB':
      return Math.round(numValue * BYTES_PER_MB)
    case 'GB':
      return Math.round(numValue * BYTES_PER_GB)
    case 'TB':
      return Math.round(numValue * BYTES_PER_TB)
    default:
      return null
  }
}

export const Route = createFileRoute('/(app)/buckets/$id/settings')({
  component: RouteComponent,
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(bucketQuery(params.id))
  }
})

function bucketQuery(bucketId: string) {
  return queryOptions({
    queryKey: ['bucket', bucketId],
    queryFn: () => getBucketInfo({ id: bucketId })
  })
}

function RouteComponent() {
  const { id } = Route.useParams()
  const { queryClient } = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showAddGlobalAliasDialog, setShowAddGlobalAliasDialog] = React.useState(false)
  const [showDeleteGlobalAliasConfirm, setShowDeleteGlobalAliasConfirm] = React.useState(false)
  const [showDeleteKeyConfirm, setShowDeleteKeyConfirm] = React.useState(false)
  const [showKeySelectorDialog, setShowKeySelectorDialog] = React.useState(false)
  const [showAddLocalAliasDialog, setShowAddLocalAliasDialog] = React.useState(false)
  const [isAddingLocalAlias, setIsAddingLocalAlias] = React.useState(false)
  const [globalAliasToDelete, setGlobalAliasToDelete] = React.useState<string | null>(null)
  const [keyToDelete, setKeyToDelete] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [showDeleteLocalAliasConfirm, setShowDeleteLocalAliasConfirm] = React.useState(false)
  const [localAliasToDelete, setLocalAliasToDelete] = React.useState<{
    accessKeyId: string
    alias: string
  } | null>(null)

  // Inline edit form state
  const [websiteAccessEnabled, setWebsiteAccessEnabled] = React.useState(false)
  const [indexDocument, setIndexDocument] = React.useState('')
  const [errorDocument, setErrorDocument] = React.useState('')
  const [maxObjects, setMaxObjects] = React.useState<string>('')
  const [maxSize, setMaxSize] = React.useState('')
  const [maxSizeUnit, setMaxSizeUnit] = React.useState<SizeUnit>('GB')
  const [sizeWarning, setSizeWarning] = React.useState<string | null>(null)

  // Fetch bucket info
  const { data: bucketData } = useSuspenseQuery(bucketQuery(id))
  const bucket = bucketData?.data

  // Initialize form with bucket data
  React.useEffect(() => {
    if (bucket) {
      setWebsiteAccessEnabled(bucket.websiteAccess)
      setIndexDocument(bucket.websiteConfig?.indexDocument || '')
      setErrorDocument(bucket.websiteConfig?.errorDocument || '')
      setMaxObjects(bucket.quotas?.maxObjects?.toString() || '')
      const sizeData = bytesToSizeUnit(bucket.quotas?.maxSize)
      setMaxSize(sizeData.value)
      setMaxSizeUnit(sizeData.unit)
    }
  }, [bucket])

  // Validate max size minimum limit (100MB)
  React.useEffect(() => {
    if (!maxSize || maxSize === '') {
      setSizeWarning(null)
      return
    }

    const numValue = parseFloat(maxSize)
    if (isNaN(numValue) || numValue <= 0) {
      setSizeWarning(null)
      return
    }

    const bytes = sizeUnitToBytes(maxSize, maxSizeUnit)
    const MIN_SIZE_BYTES = 100 * BYTES_PER_MB

    if (bytes !== null && bytes < MIN_SIZE_BYTES) {
      const currentSizeInMB = bytes / BYTES_PER_MB
      setSizeWarning(
        `Current size (${currentSizeInMB.toFixed(2)} MB) is below the minimum limit of 100MB. Please increase the size.`
      )
    } else {
      setSizeWarning(null)
    }
  }, [maxSize, maxSizeUnit])

  // Update bucket mutation
  const updateBucketMutation = useMutation({
    mutationFn: async (values: UpdateBucketRequest) => {
      return updateBucket(id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Bucket updated successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update bucket')
    }
  })

  // Delete bucket mutation
  const deleteBucketMutation = useMutation({
    mutationFn: async () => {
      return deleteBucket(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Bucket deleted successfully!')
      navigate({ to: '/buckets' })
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete bucket')
    }
  })

  // Add global alias mutation
  const addGlobalAliasMutation = useMutation({
    mutationFn: async (globalAlias: string) => {
      const data: AddGlobalBucketAliasRequest = { globalAlias, bucketId: id }
      return addBucketAlias(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Global alias added successfully!')
      setShowAddGlobalAliasDialog(false)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add global alias')
    }
  })

  // Remove global alias mutation
  const removeGlobalAliasMutation = useMutation({
    mutationFn: async (globalAlias: string) => {
      const data: Omit<RemoveBucketGlobalAliasRequest, 'bucketId'> = { globalAlias }
      return removeBucketAlias(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Global alias removed successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove global alias')
    }
  })

  // Add local alias mutation
  const addLocalAliasMutation = useMutation({
    mutationFn: async (data: AddLocalBucketAliasRequest) => {
      return addBucketAlias(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Local alias added successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add local alias')
    }
  })

  // Remove local alias mutation
  const removeLocalAliasMutation = useMutation({
    mutationFn: async (data: { localAlias: string; accessKeyId: string }) => {
      const requestData: Omit<RemoveBucketLocalAliasRequest, 'bucketId'> = {
        localAlias: data.localAlias,
        accessKeyId: data.accessKeyId
      }
      return removeBucketAlias(id, requestData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      setSuccessMessage('Local alias removed successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to remove local alias')
    }
  })

  // Allow bucket key mutation
  const allowBucketKeyMutation = useMutation({
    mutationFn: async (data: {
      accessKeyId: string
      permissions: { owner?: boolean; read?: boolean; write?: boolean }
    }) => {
      const requestData: Omit<AllowBucketKeyRequest, 'bucketId'> = {
        accessKeyId: data.accessKeyId,
        permissions: {
          owner: data.permissions.owner ?? false,
          read: data.permissions.read ?? false,
          write: data.permissions.write ?? false
        }
      }
      return allowBucketKey(id, requestData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      setSuccessMessage('Key permissions updated successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update key permissions')
    }
  })

  // Deny bucket key mutation
  const denyBucketKeyMutation = useMutation({
    mutationFn: async (data: {
      accessKeyId: string
      permissions: { owner?: boolean; read?: boolean; write?: boolean }
    }) => {
      const requestData: Omit<DenyBucketKeyRequest, 'bucketId'> = {
        accessKeyId: data.accessKeyId,
        permissions: {
          owner: data.permissions.owner ?? false,
          read: data.permissions.read ?? false,
          write: data.permissions.write ?? false
        }
      }
      return denyBucketKey(id, requestData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      setSuccessMessage('Key permissions updated successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update key permissions')
    }
  })

  const handleDeleteBucket = () => {
    if (!bucket) return
    if (bucket.objects > 0) {
      setErrorMessage(
        `Cannot delete bucket. This bucket contains ${bucket.objects} object${bucket.objects !== 1 ? 's' : ''}. You must delete all objects before deleting the bucket.`
      )
      return
    }
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    await deleteBucketMutation.mutateAsync()
    setShowDeleteConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
  }

  const handleEditBucket = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate max size minimum limit (100MB)
    if (maxSize) {
      const bytes = sizeUnitToBytes(maxSize, maxSizeUnit)
      const MIN_SIZE_BYTES = 100 * BYTES_PER_MB
      if (bytes !== null && bytes < MIN_SIZE_BYTES) {
        setErrorMessage('Max size must be at least 100MB')
        return
      }
    }

    const values: UpdateBucketRequest = {
      websiteAccess: null,
      quotas: {
        maxObjects: null,
        maxSize: null
      }
    }

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
        maxSize: sizeUnitToBytes(maxSize, maxSizeUnit)
      }
    }

    await updateBucketMutation.mutateAsync(values)
  }

  const handleAddGlobalAlias = async (globalAlias: string) => {
    await addGlobalAliasMutation.mutateAsync(globalAlias)
  }

  const handleRemoveGlobalAlias = (alias: string) => {
    setGlobalAliasToDelete(alias)
    setShowDeleteGlobalAliasConfirm(true)
  }

  const handleConfirmDeleteGlobalAlias = async () => {
    if (globalAliasToDelete) {
      await removeGlobalAliasMutation.mutateAsync(globalAliasToDelete)
      setShowDeleteGlobalAliasConfirm(false)
      setGlobalAliasToDelete(null)
    }
  }

  const handleCancelDeleteGlobalAlias = () => {
    setShowDeleteGlobalAliasConfirm(false)
    setGlobalAliasToDelete(null)
  }

  const handleAddLocalAlias = async (data: { accessKeyId: string; alias: string }) => {
    const requestData: AddLocalBucketAliasRequest = {
      localAlias: data.alias,
      bucketId: id,
      accessKeyId: data.accessKeyId
    }
    await addLocalAliasMutation.mutateAsync(requestData)
  }

  const handleRemoveLocalAlias = (accessKeyId: string, alias: string) => {
    setLocalAliasToDelete({ accessKeyId, alias })
    setShowDeleteLocalAliasConfirm(true)
  }

  const handleConfirmDeleteLocalAlias = async () => {
    if (localAliasToDelete) {
      await removeLocalAliasMutation.mutateAsync({
        localAlias: localAliasToDelete.alias,
        accessKeyId: localAliasToDelete.accessKeyId
      })
      setShowDeleteLocalAliasConfirm(false)
      setLocalAliasToDelete(null)
    }
  }

  const handleCancelDeleteLocalAlias = () => {
    setShowDeleteLocalAliasConfirm(false)
    setLocalAliasToDelete(null)
  }

  const handleAllowBucketKey = async (
    accessKeyId: string,
    permissions: { owner?: boolean; read?: boolean; write?: boolean }
  ) => {
    await allowBucketKeyMutation.mutateAsync({ accessKeyId, permissions })
  }

  const handleViewKey = (accessKeyId: string) => {
    navigate({ to: '/keys/$id', params: { id: accessKeyId } })
  }

  const handleDeleteKey = (accessKeyId: string) => {
    setKeyToDelete(accessKeyId)
    setShowDeleteKeyConfirm(true)
  }

  const handleConfirmDeleteKey = async () => {
    if (keyToDelete) {
      await denyBucketKeyMutation.mutateAsync({
        accessKeyId: keyToDelete,
        permissions: { owner: true, read: true, write: true }
      })
      setShowDeleteKeyConfirm(false)
      setKeyToDelete(null)
    }
  }

  const handleCancelDeleteKey = () => {
    setShowDeleteKeyConfirm(false)
    setKeyToDelete(null)
  }

  const handleCloseKeySelector = () => {
    setShowKeySelectorDialog(false)
  }

  const handleAllowBucketKeyFromDialog = async (
    accessKeyId: string,
    permissions: { owner?: boolean; read?: boolean; write?: boolean }
  ) => {
    await handleAllowBucketKey(accessKeyId, permissions)
    setShowKeySelectorDialog(false)
  }

  const handleAddLocalAliasFromDialog = async (data: { accessKeyId: string; alias: string }) => {
    setIsAddingLocalAlias(true)
    try {
      await handleAddLocalAlias(data)
      setShowAddLocalAliasDialog(false)
    } finally {
      setIsAddingLocalAlias(false)
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

  if (!bucket) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center'>
          <svg className='size-12 animate-spin' fill='none' viewBox='0 0 24 24'>
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
              d='M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          <p className='mt-4 text-sm text-gray-600'>Loading bucket settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-5xl space-y-6'>
      {/* Page Header */}
      <div className='min-w-0 flex-1'>
        <div className='flex items-center justify-between'>
          <div>
            <Link
              to='/buckets/$id'
              params={{ id }}
              search={{ key: undefined, prefix: undefined }}
              className='mb-3 inline-flex items-center text-sm text-gray-500 hover:text-gray-700'
            >
              <Lucide.ArrowLeft className='mr-2 size-4' />
              Back to Bucket
            </Link>
            <h1 className='text-3xl font-bold text-gray-900'>Bucket Settings</h1>
            <p className='mt-1 text-base text-gray-500'>Manage settings for bucket {bucket.id}</p>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className='min-w-0 flex-1'>
        <div className='space-y-6'>
          {/* Alerts */}
          {successMessage && (
            <div className='mx-auto w-full'>
              <Alert variant='success'>{successMessage}</Alert>
            </div>
          )}
          {errorMessage && (
            <div className='mx-auto w-full'>
              <Alert variant='danger'>{errorMessage}</Alert>
            </div>
          )}

          {/* Settings Form */}
          <BucketConfigurationForm
            websiteAccessEnabled={websiteAccessEnabled}
            setWebsiteAccessEnabled={setWebsiteAccessEnabled}
            indexDocument={indexDocument}
            setIndexDocument={setIndexDocument}
            errorDocument={errorDocument}
            setErrorDocument={setErrorDocument}
            maxObjects={maxObjects}
            setMaxObjects={setMaxObjects}
            maxSize={maxSize}
            setMaxSize={setMaxSize}
            maxSizeUnit={maxSizeUnit}
            setMaxSizeUnit={setMaxSizeUnit}
            isPending={updateBucketMutation.isPending}
            onSubmit={handleEditBucket}
            sizeWarning={sizeWarning}
          />

          {/* Aliases Section */}
          <AliasesSection
            bucket={bucket}
            onShowAddGlobalAliasDialog={() => setShowAddGlobalAliasDialog(true)}
            onShowAddLocalAliasDialog={() => setShowAddLocalAliasDialog(true)}
            onRemoveGlobalAlias={handleRemoveGlobalAlias}
            onRemoveLocalAlias={handleRemoveLocalAlias}
          />

          {/* Access Keys Section */}
          <AccessKeysSection
            bucket={bucket}
            onShowKeySelectorDialog={() => setShowKeySelectorDialog(true)}
            onViewKey={handleViewKey}
            onDeleteKey={handleDeleteKey}
          />

          {/* Delete Bucket Section - Moved to Last Position */}
          <DeleteBucketSection onDeleteBucket={handleDeleteBucket} objectCount={bucket.objects} />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title='Delete Bucket'
        message='Are you sure you want to delete this bucket? This action cannot be undone and will permanently remove bucket and all its contents.'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={deleteBucketMutation.isPending}
      />

      {/* Add Global Alias Dialog */}
      <AddGlobalAlias
        isOpen={showAddGlobalAliasDialog}
        onClose={() => setShowAddGlobalAliasDialog(false)}
        onSubmit={handleAddGlobalAlias}
        isSubmitting={addGlobalAliasMutation.isPending}
      />

      {/* Delete Global Alias Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteGlobalAliasConfirm}
        title='Delete Global Alias'
        message={`Are you sure you want to delete the global alias "${globalAliasToDelete}"? This action cannot be undone.`}
        onConfirm={handleConfirmDeleteGlobalAlias}
        onCancel={handleCancelDeleteGlobalAlias}
        isConfirming={removeGlobalAliasMutation.isPending}
      />

      {/* Delete Key Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteKeyConfirm}
        title='Delete Key'
        message={`Are you sure you want to delete the key "${keyToDelete}"? This action cannot be undone.`}
        onConfirm={handleConfirmDeleteKey}
        onCancel={handleCancelDeleteKey}
        isConfirming={denyBucketKeyMutation.isPending}
      />

      {/* Delete Local Alias Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteLocalAliasConfirm}
        title='Delete Local Alias'
        message={`Are you sure you want to delete local alias "${localAliasToDelete?.alias}"? This action cannot be undone.`}
        onConfirm={handleConfirmDeleteLocalAlias}
        onCancel={handleCancelDeleteLocalAlias}
        isConfirming={removeLocalAliasMutation.isPending}
      />

      {/* Key Selector Dialog */}
      <KeySelectorDialog
        isOpen={showKeySelectorDialog}
        onClose={handleCloseKeySelector}
        bucket={bucket}
        onAllowKey={handleAllowBucketKeyFromDialog}
      />

      {/* Add Local Alias Dialog */}
      <AddLocalAlias
        isOpen={showAddLocalAliasDialog}
        onClose={() => setShowAddLocalAliasDialog(false)}
        onSubmit={handleAddLocalAliasFromDialog}
        isSubmitting={isAddingLocalAlias}
      />
    </div>
  )
}
