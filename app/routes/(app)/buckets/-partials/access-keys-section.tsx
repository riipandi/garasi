import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

interface AccessKeysSectionProps {
  bucket: GetBucketInfoResponse
  onShowKeySelectorDialog: () => void
  onViewKey: (accessKeyId: string) => void
  onDeleteKey: (accessKeyId: string) => void
}

export function AccessKeysSection({
  bucket,
  onShowKeySelectorDialog,
  onViewKey,
  onDeleteKey
}: AccessKeysSectionProps) {
  const keys = Array.isArray(bucket.keys) ? bucket.keys : []
  const hasKeys = keys.length > 0

  return (
    <div className='border-border bg-background overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-border border-b px-6 py-4'>
        <Heading level={3} size='md'>
          Access Keys
        </Heading>
        <Text className='text-muted-foreground text-sm'>
          Manage access keys that can access this bucket
        </Text>
      </div>
      <div className='p-6'>
        {hasKeys ? (
          <Stack>
            {keys.map((key) => (
              <div
                key={key.accessKeyId}
                className='border-border bg-background flex items-center justify-between rounded-md border px-4 py-3 shadow-sm'
              >
                <div className='flex items-center gap-3'>
                  <IconBox variant='tertiary-subtle' size='sm'>
                    <Lucide.Lock className='size-4' />
                  </IconBox>
                  <div>
                    <Text className='text-sm font-medium'>{key.name}</Text>
                    <Text className='text-muted-foreground ml-2 text-sm'>({key.accessKeyId})</Text>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Stack direction='row'>
                    {key.permissions.owner && (
                      <Text className='inline-flex items-center rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800'>
                        Owner
                      </Text>
                    )}
                    {key.permissions.read && (
                      <Text className='inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
                        Read
                      </Text>
                    )}
                    {key.permissions.write && (
                      <Text className='inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800'>
                        Write
                      </Text>
                    )}
                  </Stack>
                  <div className='border-border ml-4 flex items-center gap-2 border-l pl-4'>
                    <Button
                      type='button'
                      variant='plain'
                      size='sm'
                      onClick={() => onViewKey(key.accessKeyId)}
                    >
                      <Lucide.Eye className='size-4' />
                      View Key
                    </Button>
                    <Button
                      type='button'
                      variant='danger'
                      size='sm'
                      onClick={() => onDeleteKey(key.accessKeyId)}
                    >
                      <Lucide.Trash2 className='size-4' />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Stack>
        ) : (
          <div className='border-border bg-muted/5 flex items-center gap-4 rounded-lg border-2 border-dashed px-4 py-4'>
            <IconBox variant='tertiary-subtle' size='md' circle>
              <Lucide.Lock className='size-6' />
            </IconBox>
            <div className='flex-1'>
              <Text className='text-sm font-medium'>
                No access keys have access to this bucket.
              </Text>
              <Text className='text-muted-foreground text-sm'>
                Keys that have access to this bucket will appear here.
              </Text>
            </div>
            <Button type='button' variant='primary' onClick={onShowKeySelectorDialog}>
              <Lucide.Plus className='size-4' />
              Assign Key
            </Button>
          </div>
        )}

        {hasKeys && (
          <div className='border-border mt-4 flex justify-end border-t pt-4'>
            <Button type='button' variant='outline' onClick={onShowKeySelectorDialog}>
              <Lucide.Plus className='size-4' />
              Assign Key
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
