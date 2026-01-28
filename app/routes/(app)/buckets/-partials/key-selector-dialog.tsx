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
import { InputGroup, InputGroupAddon } from '~/app/components/input-group'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import fetcher from '~/app/fetcher'
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
  const [searchQuery, setSearchQuery] = React.useState('')

  const { data: keysData, isLoading: isKeysLoading } = useQuery({
    queryKey: ['keys'],
    queryFn: () => fetcher<{ data: ListAccessKeysResponse[] }>('/keys')
  })

  const allKeys = keysData?.data ?? []

  const assignedKeyIds = Array.isArray(bucket.keys) ? bucket.keys.map((k) => k.accessKeyId) : []
  const availableKeys = allKeys.filter((key) => !assignedKeyIds.includes(key.id))

  const filteredKeys = availableKeys.filter((key) => {
    const query = searchQuery.toLowerCase()
    return key.name.toLowerCase().includes(query) || key.id.toLowerCase().includes(query)
  })

  const handleClose = () => {
    onClose()
    setSelectedKey(null)
    setPermissions({ owner: true, read: true, write: true })
    setSearchQuery('')
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
    <Dialog open={isOpen}>
      <DialogPopup className='max-w-md'>
        <DialogHeader>
          <Stack direction='row' className='items-start'>
            <IconBox variant='info' size='md' circle>
              <Lucide.Lock className='size-5' />
            </IconBox>
            <div>
              <DialogTitle>Allow Access Key</DialogTitle>
              <Text className='text-muted-foreground text-xs'>Grant access to this bucket</Text>
            </div>
          </Stack>
          <DialogClose>
            <Button type='button' variant='plain' size='sm-icon'>
              <Lucide.X className='size-5' />
            </Button>
          </DialogClose>
        </DialogHeader>

        <DialogBody>
          {isKeysLoading ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <Spinner className='text-primary size-8' />
              <Text className='text-muted-foreground mt-3 text-sm'>Loading keys...</Text>
            </div>
          ) : availableKeys.length === 0 ? (
            <div className='border-border bg-muted/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12'>
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
                <InputGroup>
                  <InputGroupAddon align='start'>
                    <Lucide.Search className='text-muted-foreground size-4' />
                  </InputGroupAddon>
                  <input
                    type='text'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search by name or ID...'
                    className='flex-1 bg-transparent py-2 pr-4 pl-2 text-sm outline-none'
                  />
                  {searchQuery && (
                    <InputGroupAddon align='end'>
                      <Button
                        type='button'
                        variant='plain'
                        size='xs-icon'
                        onClick={() => setSearchQuery('')}
                      >
                        <Lucide.X className='size-3' />
                      </Button>
                    </InputGroupAddon>
                  )}
                </InputGroup>

                <div className='border-border max-h-56 overflow-y-auto rounded-lg border'>
                  {filteredKeys.length === 0 ? (
                    <div className='flex flex-col items-center justify-center px-4 py-8'>
                      <IconBox variant='tertiary-subtle' size='md' circle>
                        <Lucide.Search className='size-8' />
                      </IconBox>
                      <Text className='text-muted-foreground mt-2 text-sm'>
                        {searchQuery ? 'No keys found matching your search' : 'No keys available'}
                      </Text>
                    </div>
                  ) : (
                    <Stack>
                      {filteredKeys.map((key) => (
                        <button
                          key={key.id}
                          type='button'
                          onClick={() => handleSelectKey(key.id)}
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-all ${
                            selectedKey === key.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                          }`}
                        >
                          <IconBox
                            variant={selectedKey === key.id ? 'primary' : 'secondary-subtle'}
                            size='sm'
                            circle
                          >
                            {selectedKey === key.id ? (
                              <Lucide.Check className='size-3.5' />
                            ) : (
                              <Lucide.Key className='size-3' />
                            )}
                          </IconBox>
                          <div className='min-w-0 flex-1'>
                            <Text className='block truncate text-sm font-medium'>{key.name}</Text>
                            <Text className='text-muted-foreground block truncate font-mono text-xs'>
                              {key.id}
                            </Text>
                          </div>
                        </button>
                      ))}
                    </Stack>
                  )}
                </div>

                <div className='text-muted-foreground mt-2 flex items-center justify-between text-xs'>
                  <Text>
                    Showing {filteredKeys.length} of {availableKeys.length} key
                    {availableKeys.length !== 1 ? 's' : ''}
                  </Text>
                  {searchQuery && (
                    <Button
                      type='button'
                      variant='plain'
                      size='xs'
                      onClick={() => setSearchQuery('')}
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              </div>

              <div className='border-border bg-muted/30 rounded-lg border p-4'>
                <Text className='text-muted-foreground mb-3 block text-xs font-semibold tracking-wider uppercase'>
                  Permissions
                </Text>
                <Stack direction='row'>
                  <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                    <Checkbox
                      id='owner'
                      checked={permissions.owner}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, owner: checked as boolean })
                      }
                    />
                    <Text className='text-sm font-medium'>Owner</Text>
                  </div>
                  <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                    <Checkbox
                      id='read'
                      checked={permissions.read}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, read: checked as boolean })
                      }
                    />
                    <Text className='text-sm font-medium'>Read</Text>
                  </div>
                  <div className='border-border bg-background hover:border-primary/50 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 transition-all'>
                    <Checkbox
                      id='write'
                      checked={permissions.write}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, write: checked as boolean })
                      }
                    />
                    <Text className='text-sm font-medium'>Write</Text>
                  </div>
                </Stack>
              </div>
            </>
          )}
        </DialogBody>

        {availableKeys.length > 0 && !isKeysLoading && filteredKeys.length > 0 && (
          <DialogFooter>
            <DialogClose>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type='button'
              variant='primary'
              disabled={!selectedKey}
              onClick={handleAllowSelectedKey}
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
