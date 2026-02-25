import { queryOptions, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
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
import { Button } from '~/app/components/button'
import { Spinner } from '~/app/components/spinner'
import { toast } from '~/app/components/toast'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import bucketService from '~/app/services/bucket.service'
import keysService from '~/app/services/keys.service'
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

const BYTES_PER_MB = 1024 * 1024
const BYTES_PER_GB = 1024 * 1024 * 1024
const BYTES_PER_TB = 1024 * 1024 * 1024 * 1024

function bytesToSizeUnit(bytes: number | null | undefined): { value: string; unit: SizeUnit } {
  if (!bytes || bytes === 0) {
    return { value: '', unit: 'GB' }
  }

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
    context.queryClient.ensureQueryData(keysQuery())
  },
  staticData: { breadcrumb: ['Buckets', 'Details', 'Settings'] }
})

function bucketQuery(bucketId: string) {
  return queryOptions({
    queryKey: ['bucket', bucketId],
    queryFn: () => bucketService.getBucketInfo({ id: bucketId })
  })
}

function keysQuery() {
  return queryOptions({
    queryKey: ['keys'],
    queryFn: () => keysService.listAccessKeys()
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
  const [showDeleteLocalAliasConfirm, setShowDeleteLocalAliasConfirm] = React.useState(false)
  const [localAliasToDelete, setLocalAliasToDelete] = React.useState<{
    accessKeyId: string
    alias: string
  } | null>(null)

  const [websiteAccessEnabled, setWebsiteAccessEnabled] = React.useState(false)
  const [indexDocument, setIndexDocument] = React.useState('')
  const [errorDocument, setErrorDocument] = React.useState('')
  const [maxObjects, setMaxObjects] = React.useState('')
  const [maxSize, setMaxSize] = React.useState('')
  const [maxSizeUnit, setMaxSizeUnit] = React.useState<SizeUnit>('GB')
  const [sizeWarning, setSizeWarning] = React.useState<string | null>(null)

  const { data: bucketData } = useSuspenseQuery(bucketQuery(id))
  const bucket = bucketData?.data

  const { data: keysData } = useSuspenseQuery(keysQuery())
  const keys = keysData?.data ?? []

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

  const updateBucketMutation = useMutation({
    mutationFn: async (values: UpdateBucketRequest) => {
      return bucketService.updateBucket(id, values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Bucket updated successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update bucket'
      toast.add({ title: 'Update failed', description: errorMsg, type: 'error' })
    }
  })

  const deleteBucketMutation = useMutation({
    mutationFn: async () => {
      return bucketService.deleteBucket(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Bucket deleted successfully', type: 'success' })
      navigate({ to: '/buckets' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete bucket'
      toast.add({ title: 'Deletion failed', description: errorMsg, type: 'error' })
    }
  })

  const addGlobalAliasMutation = useMutation({
    mutationFn: async (globalAlias: string) => {
      const data: AddGlobalBucketAliasRequest = { globalAlias, bucketId: id }
      return bucketService.addBucketAlias(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Global alias added successfully', type: 'success' })
      setShowAddGlobalAliasDialog(false)
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add global alias'
      toast.add({ title: 'Add failed', description: errorMsg, type: 'error' })
    }
  })

  const removeGlobalAliasMutation = useMutation({
    mutationFn: async (globalAlias: string) => {
      const data: Omit<RemoveBucketGlobalAliasRequest, 'bucketId'> = { globalAlias }
      return bucketService.removeBucketAlias(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Global alias removed successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove global alias'
      toast.add({ title: 'Remove failed', description: errorMsg, type: 'error' })
    }
  })

  const addLocalAliasMutation = useMutation({
    mutationFn: async (data: AddLocalBucketAliasRequest) => {
      return bucketService.addBucketAlias(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Local alias added successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add local alias'
      toast.add({ title: 'Add failed', description: errorMsg, type: 'error' })
    }
  })

  const removeLocalAliasMutation = useMutation({
    mutationFn: async (data: { localAlias: string; accessKeyId: string }) => {
      const requestData: Omit<RemoveBucketLocalAliasRequest, 'bucketId'> = {
        localAlias: data.localAlias,
        accessKeyId: data.accessKeyId
      }
      return bucketService.removeBucketAlias(id, requestData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      queryClient.invalidateQueries({ queryKey: ['buckets'] })
      toast.add({ title: 'Local alias removed successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove local alias'
      toast.add({ title: 'Remove failed', description: errorMsg, type: 'error' })
    }
  })

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
      return bucketService.allowBucketKey(id, requestData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      toast.add({ title: 'Key permissions updated successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update key permissions'
      toast.add({ title: 'Update failed', description: errorMsg, type: 'error' })
    }
  })

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
      return bucketService.denyBucketKey(id, requestData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucket', id] })
      toast.add({ title: 'Key permissions updated successfully', type: 'success' })
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update key permissions'
      toast.add({ title: 'Update failed', description: errorMsg, type: 'error' })
    }
  })

  const handleDeleteBucket = () => {
    if (!bucket) return
    if (bucket.objects > 0) {
      toast.add({
        title: 'Cannot delete bucket',
        description: `This bucket contains ${bucket.objects} object${bucket.objects !== 1 ? 's' : ''}. You must delete all objects before deleting the bucket.`,
        type: 'error'
      })
      return
    }
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    await deleteBucketMutation.mutateAsync()
    setShowDeleteConfirm(false)
  }

  const handleEditBucket = async (e: React.FormEvent) => {
    e.preventDefault()

    if (maxSize) {
      const bytes = sizeUnitToBytes(maxSize, maxSizeUnit)
      const MIN_SIZE_BYTES = 100 * BYTES_PER_MB
      if (bytes !== null && bytes < MIN_SIZE_BYTES) {
        toast.add({
          title: 'Validation error',
          description: 'Max size must be at least 100MB',
          type: 'error'
        })
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

    if (websiteAccessEnabled || indexDocument || errorDocument) {
      values.websiteAccess = {
        enabled: websiteAccessEnabled,
        indexDocument: indexDocument || null,
        errorDocument: errorDocument || null
      }
    }

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

  if (!bucket) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='flex flex-col items-center'>
          <Spinner className='text-primary size-12' />
          <Text className='text-muted-foreground mt-4'>Loading bucket settings...</Text>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-4xl space-y-8'>
      <div className='flex items-start gap-4'>
        <Link
          to='/buckets/$id'
          params={{ id }}
          search={{ key: undefined, prefix: undefined }}
          className='hover:bg-dimmed/10 rounded-md p-2 text-gray-500 transition-colors hover:text-gray-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
        >
          <Lucide.ArrowLeft className='size-5' />
        </Link>
        <div className='min-w-0 flex-1'>
          <div className='space-y-1'>
            <Heading size='lg'>Bucket Settings</Heading>
            <Text className='text-muted-foreground'>Manage settings for bucket {bucket.id}</Text>
          </div>
        </div>
      </div>

      <div className='min-w-0 flex-1 space-y-8'>
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

        <AliasesSection
          bucket={bucket}
          onShowAddGlobalAliasDialog={() => setShowAddGlobalAliasDialog(true)}
          onShowAddLocalAliasDialog={() => setShowAddLocalAliasDialog(true)}
          onRemoveGlobalAlias={handleRemoveGlobalAlias}
          onRemoveLocalAlias={handleRemoveLocalAlias}
        />

        <AccessKeysSection
          bucket={bucket}
          onShowKeySelectorDialog={() => setShowKeySelectorDialog(true)}
          onViewKey={handleViewKey}
          onDeleteKey={handleDeleteKey}
        />

        <DeleteBucketSection onDeleteBucket={handleDeleteBucket} objectCount={bucket.objects} />
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bucket</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete this bucket? <br />
              This action cannot be undone and will permanently remove bucket and all its contents.
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

      <AddGlobalAlias
        isOpen={showAddGlobalAliasDialog}
        onClose={() => setShowAddGlobalAliasDialog(false)}
        onSubmit={handleAddGlobalAlias}
        isSubmitting={addGlobalAliasMutation.isPending}
      />

      <AlertDialog
        open={showDeleteGlobalAliasConfirm}
        onOpenChange={setShowDeleteGlobalAliasConfirm}
      >
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Global Alias</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete global alias "{globalAliasToDelete}"? <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={handleConfirmDeleteGlobalAlias}
                  disabled={removeGlobalAliasMutation.isPending}
                  progress={removeGlobalAliasMutation.isPending}
                >
                  {removeGlobalAliasMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog open={showDeleteKeyConfirm} onOpenChange={setShowDeleteKeyConfirm}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Key</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete key "{keyToDelete}"? <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={handleConfirmDeleteKey}
                  disabled={denyBucketKeyMutation.isPending}
                  progress={denyBucketKeyMutation.isPending}
                >
                  {denyBucketKeyMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <AlertDialog open={showDeleteLocalAliasConfirm} onOpenChange={setShowDeleteLocalAliasConfirm}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Local Alias</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete local alias "{localAliasToDelete?.alias}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={handleConfirmDeleteLocalAlias}
                  disabled={removeLocalAliasMutation.isPending}
                  progress={removeLocalAliasMutation.isPending}
                >
                  {removeLocalAliasMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

      <KeySelectorDialog
        isOpen={showKeySelectorDialog}
        onClose={handleCloseKeySelector}
        bucket={bucket}
        onAllowKey={handleAllowBucketKeyFromDialog}
      />

      <AddLocalAlias
        isOpen={showAddLocalAliasDialog}
        onClose={() => setShowAddLocalAliasDialog(false)}
        onSubmit={handleAddLocalAliasFromDialog}
        isSubmitting={isAddingLocalAlias}
        keys={keys}
      />
    </div>
  )
}
