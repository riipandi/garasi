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
    await createKeyMutation.mutateAsync(values as CreateAccessKeyRequest)
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

  const handleDeleteAllKeys = () => {
    setShowDeleteAllConfirm(true)
  }

  const handleConfirmDeleteAll = async () => {
    await Promise.all(keys.map((key) => deleteKeyMutation.mutateAsync(key.id)))
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
    <div className='mx-auto space-y-6'>
      <div className='min-w-0 flex-1 space-y-1.5'>
        <Heading level={1} size='lg'>
          Access Keys
        </Heading>
        <Text className='text-muted'>Manage access keys for S3 API authentication</Text>
      </div>

      <Stack direction='column' spacing='lg'>
        <Stack direction='row' className='flex-wrap gap-2'>
          <Button onClick={handleShowCreateForm}>
            <Lucide.Plus className='size-4' />
            Create Key
          </Button>
          <Button variant='outline' onClick={() => setShowKeyImport(true)}>
            <Lucide.Download className='size-4' />
            Import Key
          </Button>
          <Button variant='outline' onClick={handleDeleteAllKeys} disabled={keys.length === 0}>
            <Lucide.Trash2 className='size-4' />
            Delete All
          </Button>
          <Button
            variant='outline'
            onClick={handleRefreshKeys}
            disabled={isRefreshing}
            progress={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>

        {successMessage && <Alert variant='success'>{successMessage}</Alert>}
        {errorMessage && <Alert variant='danger'>{errorMessage}</Alert>}

        <KeyTable keys={keys} onDelete={handleDeleteKey} isLoading={isRefreshing} />

        <Alert variant='info'>
          <Lucide.Info className='size-4' />
          <div>
            <h4 className='text-sm font-medium'>Information</h4>
            <p className='mt-1 text-xs'>
              Access keys are used to authenticate with the Garage S3 API. Each key consists of an
              Access Key ID and a Secret Key ID. Keep your secret keys secure and never share them
              publicly.
            </p>
          </div>
        </Alert>
      </Stack>

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
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Access Key</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete this access key? This action cannot be undone and will
              permanently remove the key from your account.
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

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Access Keys</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            <AlertDialogDescription>
              Are you sure you want to delete all {keys.length} access keys? This action cannot be
              undone and will permanently remove all keys from your account.
            </AlertDialogDescription>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogClose>Cancel</AlertDialogClose>
            <AlertDialogClose
              render={
                <Button
                  variant='danger'
                  onClick={handleConfirmDeleteAll}
                  disabled={deleteKeyMutation.isPending}
                >
                  {deleteKeyMutation.isPending ? 'Deleting...' : 'Delete All'}
                </Button>
              }
            />
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  )
}
