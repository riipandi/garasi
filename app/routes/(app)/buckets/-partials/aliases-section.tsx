import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Heading } from '~/app/components/heading'
import { IconBox } from '~/app/components/icon-box'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/text'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

interface AliasesSectionProps {
  bucket: GetBucketInfoResponse
  onShowAddGlobalAliasDialog: () => void
  onShowAddLocalAliasDialog: () => void
  onRemoveGlobalAlias: (alias: string) => void
  onRemoveLocalAlias: (accessKeyId: string, alias: string) => void
}

type AliasItem = {
  id: string
  alias: string
  type: 'global' | 'local'
  accessKeyId?: string
  keyName?: string
}

export function AliasesSection({
  bucket,
  onShowAddGlobalAliasDialog,
  onShowAddLocalAliasDialog,
  onRemoveGlobalAlias,
  onRemoveLocalAlias
}: AliasesSectionProps) {
  const aliases: AliasItem[] = React.useMemo(() => {
    const items: AliasItem[] = []

    bucket.globalAliases?.forEach((alias) => {
      items.push({
        id: `global-${alias}`,
        alias,
        type: 'global'
      })
    })

    bucket.keys?.forEach((key) => {
      key.bucketLocalAliases.forEach((alias) => {
        items.push({
          id: `local-${key.accessKeyId}-${alias}`,
          alias,
          type: 'local',
          accessKeyId: key.accessKeyId,
          keyName: key.name
        })
      })
    })

    return items
  }, [bucket.globalAliases, bucket.keys])

  const hasAliases = aliases.length > 0
  const isLastGlobalAlias = (bucket.globalAliases?.length ?? 0) === 1

  return (
    <div className='border-border bg-background overflow-hidden rounded-lg border shadow-sm'>
      <div className='border-border border-b px-6 py-4'>
        <Heading level={3} size='md'>
          Aliases
        </Heading>
        <Text className='text-muted-foreground text-sm'>
          Configure global and local aliases for this bucket
        </Text>
      </div>
      <div className='p-6'>
        {hasAliases ? (
          <Stack>
            {aliases.map((item) => (
              <div
                key={item.id}
                className='border-border bg-background flex items-center justify-between rounded-md border px-4 py-3 shadow-sm'
              >
                <div className='flex items-center gap-3'>
                  <div className='flex flex-col'>
                    <Text className='text-sm font-medium'>{item.alias}</Text>
                    {item.type === 'local' && item.keyName && (
                      <Text className='text-muted-foreground text-xs'>Key: {item.keyName}</Text>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <Stack direction='row'>
                    {item.type === 'global' ? (
                      <Badge variant='primary' size='sm' pill>
                        Global
                      </Badge>
                    ) : (
                      <Badge variant='tertiary' size='sm' pill>
                        Local
                      </Badge>
                    )}
                  </Stack>
                  <div className='border-border ml-4 flex items-center gap-2 border-l pl-4'>
                    <Button
                      type='button'
                      variant='danger'
                      size='sm'
                      onClick={() => {
                        if (item.type === 'global') {
                          onRemoveGlobalAlias(item.alias)
                        } else {
                          onRemoveLocalAlias(item.accessKeyId!, item.alias)
                        }
                      }}
                      disabled={item.type === 'global' && isLastGlobalAlias}
                      title={
                        item.type === 'global' && isLastGlobalAlias
                          ? 'Cannot remove last global alias'
                          : 'Remove alias'
                      }
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
          <div className='border-border bg-muted/30 flex flex-col items-center gap-6 rounded-lg border-2 border-dashed p-8'>
            <IconBox variant='tertiary-subtle' size='lg' circle>
              <Lucide.Link2 className='size-12' />
            </IconBox>
            <div className='text-center'>
              <Text className='text-base font-medium'>No aliases configured</Text>
              <Text className='text-muted-foreground text-sm'>
                Add global or local aliases to make this bucket more accessible
              </Text>
            </div>
            <Stack direction='row'>
              <Button type='button' variant='primary' onClick={onShowAddGlobalAliasDialog}>
                <Lucide.Globe className='size-4' />
                Add Global Alias
              </Button>
              <Button type='button' variant='tertiary' onClick={onShowAddLocalAliasDialog}>
                <Lucide.Key className='size-4' />
                Add Local Alias
              </Button>
            </Stack>
          </div>
        )}

        {hasAliases && (
          <div className='border-border mt-4 flex flex-wrap justify-end gap-3 border-t pt-4'>
            <Button type='button' variant='outline' onClick={onShowAddGlobalAliasDialog}>
              <Lucide.Globe className='size-4' />
              <span className='hidden sm:inline'>Add Global Alias</span>
            </Button>
            <Button type='button' variant='outline' onClick={onShowAddLocalAliasDialog}>
              <Lucide.Key className='size-4' />
              <span className='hidden sm:inline'>Add Local Alias</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
