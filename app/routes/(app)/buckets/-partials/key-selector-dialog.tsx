import { useQuery } from '@tanstack/react-query'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle
} from '~/app/components/dialog'
import { IconBox } from '~/app/components/icon-box'
import { Spinner } from '~/app/components/spinner'
import { Text } from '~/app/components/typography'
import { fetcher } from '~/app/fetcher'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'
import type { ListAccessKeysResponse } from '~/shared/schemas/keys.schema'

interface KeySelectorDialogProps {
  isOpen: boolean
  onClose: () => void
  bucket: GetBucketInfoResponse
  onAllowKey: (
    accessKeyId: string,
    permissions: { owner?: boolean; read?: boolean; write?: boolean }
  ) => void
}

export function KeySelectorDialog({ isOpen, onClose, bucket, onAllowKey }: KeySelectorDialogProps) {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null)
  const [permissions, setPermissions] = React.useState({ owner: true, read: true, write: true })

  const { data: keysData, isLoading: isKeysLoading } = useQuery({
    queryKey: ['keys'],
    queryFn: () => fetcher<{ data: ListAccessKeysResponse[] }>('/keys')
  })

  const allKeys = keysData?.data ?? []

  const assignedKeyIds = Array.isArray(bucket.keys) ? bucket.keys.map((k) => k.accessKeyId) : []
  const availableKeys = allKeys.filter((key) => !assignedKeyIds.includes(key.id))

  const handleClose = () => {
    onClose()
    setSelectedKey(null)
    setPermissions({ owner: true, read: true, write: true })
  }

  const handleSelectKey = (keyId: string) => {
    setSelectedKey(keyId)
  }

  const handleAllowSelectedKey = () => {
    if (selectedKey) {
      onAllowKey(selectedKey, permissions)
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogPopup className='max-w-md'>
        <DialogHeader>
          <IconBox variant='primary' size='sm'>
            <Lucide.Key className='size-4' />
          </IconBox>
          <DialogTitle>Allow Access Key</DialogTitle>
          <DialogClose className='ml-auto'>
            <Lucide.XIcon className='size-4' strokeWidth={2.0} />
          </DialogClose>
        </DialogHeader>

        <DialogBody className='border-border mt-3 border-t pt-4'>
          {isKeysLoading ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Spinner className='text-primary size-8' />
              <Text className='text-muted-foreground mt-3 text-sm'>Loading keys...</Text>
            </div>
          ) : availableKeys.length === 0 ? (
            <div className='border-border bg-muted/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12'>
              <IconBox variant='tertiary-subtle' size='lg' circle>
                <Lucide.Lock className='size-6' />
              </IconBox>
              <Text className='mt-3 text-sm font-medium'>
                {allKeys.length === 0 ? 'No keys available' : 'All keys already have access'}
              </Text>
              <Text className='text-muted-foreground mt-1 text-xs'>
                {allKeys.length === 0
                  ? 'Create a key first to grant access'
                  : 'All existing keys are already assigned to this bucket'}
              </Text>
            </div>
          ) : (
            <>
              <div className='mb-4'>
                <Text className='text-muted-foreground mb-2 block text-xs font-semibold tracking-wider uppercase'>
                  Select Key
                </Text>
                <select
                  id='selectedKey'
                  value={selectedKey ?? ''}
                  onChange={(e) => handleSelectKey(e.target.value)}
                  className='bg-input placeholder:text-dimmed shadow-input border-input-border focus:ring-primary h-9 w-full rounded border px-3 py-1 pr-6 text-sm transition-all focus:border-transparent focus:ring-2 focus:outline-none'
                >
                  <option value=''>Select a key...</option>
                  {availableKeys.map((key) => (
                    <option key={key.id} value={key.id}>
                      {key.name} ({key.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className='border-border bg-muted/5 rounded-lg border p-4'>
                <Text className='text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase'>
                  Permissions
                </Text>
                <div className='grid grid-cols-3 gap-2'>
                  <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                    <Checkbox
                      id='owner'
                      checked={permissions.owner}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, owner: checked as boolean })
                      }
                    />
                    <span className='text-sm font-medium'>Owner</span>
                  </div>
                  <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                    <Checkbox
                      id='read'
                      checked={permissions.read}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, read: checked as boolean })
                      }
                    />
                    <span className='text-sm font-medium'>Read</span>
                  </div>
                  <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                    <Checkbox
                      id='write'
                      checked={permissions.write}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, write: checked as boolean })
                      }
                    />
                    <span className='text-sm font-medium'>Write</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogBody>

        {availableKeys.length > 0 && !isKeysLoading && (
          <DialogFooter>
            <DialogClose block>Cancel</DialogClose>
            <Button
              type='button'
              variant='primary'
              disabled={!selectedKey}
              onClick={handleAllowSelectedKey}
              block
            >
              <Lucide.Plus className='size-4' />
              Allow Key
            </Button>
          </DialogFooter>
        )}
      </DialogPopup>
    </Dialog>
  )
}
