import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardHeaderAction,
  CardTitle
} from '~/app/components/card'
import {
  Item,
  ItemAction,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '~/app/components/item'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
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
    <Card>
      <CardHeader>
        <CardTitle>Aliases</CardTitle>
        <CardDescription>Configure global and local aliases for this bucket</CardDescription>
        {hasAliases && (
          <CardHeaderAction className='gap-3'>
            <Button size='sm' variant='outline' onClick={onShowAddGlobalAliasDialog}>
              <Lucide.Globe className='size-4' />
              Add Global
            </Button>
            <Button size='sm' variant='outline' onClick={onShowAddLocalAliasDialog}>
              <Lucide.Key className='size-4' />
              Add Local
            </Button>
          </CardHeaderAction>
        )}
      </CardHeader>
      <CardBody className='p-12'>
        {!hasAliases ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Lucide.Link2 className='text-dimmed mb-4 size-12' />
            <Text className='text-dimmed mb-4'>No aliases configured</Text>
            <Text className='text-muted-foreground mb-6'>
              Add global or local aliases to make this bucket more accessible
            </Text>
            <Stack direction='row'>
              <Button type='button' onClick={onShowAddGlobalAliasDialog}>
                <Lucide.Globe className='size-4' />
                Add Global Alias
              </Button>
              <Button type='button' variant='tertiary' onClick={onShowAddLocalAliasDialog}>
                <Lucide.Key className='size-4' />
                Add Local Alias
              </Button>
            </Stack>
          </div>
        ) : (
          <Stack spacing='md'>
            {aliases.map((item) => (
              <Item key={item.id}>
                <ItemMedia>
                  <div className='bg-dimmed/5 flex size-10 items-center justify-center rounded-full'>
                    <Lucide.Link className='text-dimmed size-5' />
                  </div>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{item.alias}</ItemTitle>
                  <ItemDescription className='text-sm font-medium'>
                    {item.type === 'local' && item.keyName
                      ? `Key: ${item.keyName}`
                      : 'Global alias'}
                  </ItemDescription>
                </ItemContent>
                <ItemAction>
                  <Badge variant={item.type === 'global' ? 'primary' : 'tertiary'} size='sm' pill>
                    {item.type === 'global' ? 'Global' : 'Local'}
                  </Badge>
                  <Button
                    type='button'
                    variant='plain'
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
                  </Button>
                </ItemAction>
              </Item>
            ))}
          </Stack>
        )}
      </CardBody>
    </Card>
  )
}
