import { queryOptions, useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Alert } from '~/app/components/alert'
import { ConfirmDialog } from '~/app/components/confirm-dialog'
import {
  listAccessKeys,
  createAccessKey,
  deleteAccessKey,
  importKey
} from '~/app/services/keys.service'
import type { ImportKeyRequest, CreateAccessKeyRequest } from '~/shared/schemas/keys.schema'
import { KeyCreate } from './-partials/key-create'
import { KeyImport } from './-partials/key-import'
import { KeyTable } from './-partials/key-table'

const keysQueryOpts = queryOptions({ queryKey: ['keys'], queryFn: () => listAccessKeys() })

export const Route = createFileRoute('/(app)/keys/')({
  component: RouteComponent,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(keysQueryOpts)
  }
})

function RouteComponent() {
  const { queryClient } = Route.useRouteContext()
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [showKeyImport, setShowKeyImport] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = React.useState(false)
  const [showCreateConfirm, setShowCreateConfirm] = React.useState(false)
  const [pendingCreateValues, setPendingCreateValues] =
    React.useState<CreateAccessKeyRequest | null>(null)
  const [keyToDelete, setKeyToDelete] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Fetch access keys
  const { data: keysData } = useSuspenseQuery(keysQueryOpts)
  const keys = Array.isArray(keysData.data) ? keysData.data : []

  // Create key mutation
  const createKeyMutation = useMutation({
    mutationFn: async (values: CreateAccessKeyRequest) => {
      return createAccessKey(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      setSuccessMessage('Access key created successfully!')
      setShowCreateDialog(false)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create access key')
    }
  })

  // Delete key mutation
  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      return deleteAccessKey(keyId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      setSuccessMessage('Access key deleted successfully!')
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to delete access key')
    }
  })

  // Import key mutation
  const importKeyMutation = useMutation({
    mutationFn: async (values: ImportKeyRequest) => {
      return importKey(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] })
      setSuccessMessage('Access key imported successfully!')
      setShowKeyImport(false)
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to import access key')
    }
  })

  const handleCreateKey = async (values: CreateAccessKeyRequest) => {
    const createValues = values as CreateAccessKeyRequest
    if (createValues.neverExpires) {
      setPendingCreateValues(createValues)
      setShowCreateConfirm(true)
    } else {
      await createKeyMutation.mutateAsync(createValues)
    }
  }

  const handleConfirmCreate = async () => {
    if (pendingCreateValues) {
      await createKeyMutation.mutateAsync(pendingCreateValues)
    }
    setShowCreateConfirm(false)
    setPendingCreateValues(null)
  }

  const handleCancelCreate = () => {
    setShowCreateConfirm(false)
    setPendingCreateValues(null)
  }

  const handleDeleteKey = (keyId: string) => {
    setKeyToDelete(keyId)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (keyToDelete) {
      await deleteKeyMutation.mutateAsync(keyToDelete)
      setShowDeleteConfirm(false)
      setKeyToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false)
    setKeyToDelete(null)
  }

  const handleDeleteAllKeys = () => {
    setShowDeleteAllConfirm(true)
  }

  const handleConfirmDeleteAll = async () => {
    await Promise.all(keys.map((key) => deleteKeyMutation.mutateAsync(key.id)))
    setShowDeleteAllConfirm(false)
  }

  const handleCancelDeleteAll = () => {
    setShowDeleteAllConfirm(false)
  }

  const handleRefreshKeys = async () => {
    setIsRefreshing(true)
    try {
      await queryClient.invalidateQueries({ queryKey: ['keys'] })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleImportKey = async (values: ImportKeyRequest) => {
    await importKeyMutation.mutateAsync(values)
  }

  const handleShowCreateForm = () => {
    setShowCreateDialog(true)
  }

  const handleCancelForm = () => {
    setShowCreateDialog(false)
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
        <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>Access Keys</h1>
        <p className='text-normal mt-2 text-gray-500'>
          Manage access keys for S3 API authentication
        </p>
      </div>

      {/* Page Content */}
      <div className='min-w-0 flex-1'>
        <div className='space-y-4'>
          {/* Action Buttons */}
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={handleShowCreateForm}
              className='flex items-center gap-2 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Plus className='size-4' />
              Create Key
            </button>
            <button
              type='button'
              onClick={() => setShowKeyImport(true)}
              className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
            >
              <Lucide.Download className='size-4' />
              Import Key
            </button>
            <button
              type='button'
              onClick={handleDeleteAllKeys}
              disabled={keys.length === 0}
              className='flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
            >
              <Lucide.Trash2 className='size-4' />
              Delete All
            </button>
            <button
              type='button'
              onClick={handleRefreshKeys}
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

          {/* Key List */}
          <KeyTable keys={keys} onDelete={handleDeleteKey} isLoading={isRefreshing} />

          {/* Info Box */}
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <div className='flex gap-3'>
              <Lucide.Info className='mt-0.5 size-5 shrink-0 text-blue-600' />
              <div>
                <h4 className='text-sm font-medium text-blue-900'>Information</h4>
                <p className='mt-1 text-xs text-blue-700'>
                  Access keys are used to authenticate with the Garage S3 API. Each key consists of
                  an Access Key ID and a Secret Key ID. Keep your secret keys secure and never share
                  them publicly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <KeyImport
        isOpen={showKeyImport}
        onClose={() => setShowKeyImport(false)}
        onSubmit={handleImportKey}
        isSubmitting={importKeyMutation.isPending}
      />

      {/* Key Create Dialog */}
      <KeyCreate
        isOpen={showCreateDialog}
        onClose={handleCancelForm}
        onSubmit={handleCreateKey}
        isSubmitting={createKeyMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title='Delete Access Key'
        message='Are you sure you want to delete this access key? This action cannot be undone and will permanently remove the key from your account.'
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={deleteKeyMutation.isPending}
      />

      {/* Delete All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteAllConfirm}
        title='Delete All Access Keys'
        message={`Are you sure you want to delete all ${keys.length} access keys? This action cannot be undone and will permanently remove all keys from your account.`}
        onConfirm={handleConfirmDeleteAll}
        onCancel={handleCancelDeleteAll}
        isConfirming={deleteKeyMutation.isPending}
      />

      {/* Create Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCreateConfirm}
        title='Create Access Key'
        message='Are you sure you want to create an access key that never expires? This key will not have an expiration date and will remain active indefinitely.'
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelCreate}
        isConfirming={createKeyMutation.isPending}
      />
    </div>
  )
}
