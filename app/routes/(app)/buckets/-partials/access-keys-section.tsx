import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
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
import { Separator } from '~/app/components/separator'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
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
    <Card>
      <CardHeader>
        <CardTitle>Access Keys</CardTitle>
        <CardDescription>Manage access keys that can access this bucket</CardDescription>
        {hasKeys && (
          <CardHeaderAction>
            <Button size='sm' variant='outline' onClick={onShowKeySelectorDialog}>
              <Lucide.Plus className='size-4' />
              Assign Key
            </Button>
          </CardHeaderAction>
        )}
      </CardHeader>
      <CardBody className='p-12'>
        {!hasKeys ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Lucide.Lock className='text-dimmed mb-4 size-12' />
            <Text className='text-dimmed mb-4'>No access keys have access to this bucket.</Text>
            <Text className='text-muted-foreground mb-6'>
              Keys that have access to this bucket will appear here.
            </Text>
            <Button type='button' onClick={onShowKeySelectorDialog}>
              <Lucide.Plus className='size-4' />
              Assign Key
            </Button>
          </div>
        ) : (
          <Stack spacing='md'>
            {keys.map((key) => (
              <Item key={key.accessKeyId}>
                <ItemMedia>
                  <div className='bg-dimmed/5 flex size-10 items-center justify-center rounded-full'>
                    <Lucide.Key className='text-dimmed size-5' />
                  </div>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{key.name}</ItemTitle>
                  <ItemDescription className='font-mono text-sm font-medium'>
                    {key.accessKeyId}
                  </ItemDescription>
                </ItemContent>
                <ItemAction>
                  <div className='flex gap-1'>
                    {key.permissions.owner && (
                      <Badge variant='primary' size='sm' pill>
                        Owner
                      </Badge>
                    )}
                    {key.permissions.read && (
                      <Badge variant='info' size='sm' pill>
                        Read
                      </Badge>
                    )}
                    {key.permissions.write && (
                      <Badge variant='success' size='sm' pill>
                        Write
                      </Badge>
                    )}
                  </div>
                  <Separator orientation='vertical' className='mx-4' />
                  <Button
                    type='button'
                    variant='plain'
                    size='sm'
                    onClick={() => onViewKey(key.accessKeyId)}
                  >
                    <Lucide.Eye className='size-4' />
                  </Button>
                  <Button
                    type='button'
                    variant='plain'
                    size='sm'
                    onClick={() => onDeleteKey(key.accessKeyId)}
                  >
                    <Lucide.Trash2 className='size-4' />
                  </Button>
                </ItemAction>
              </Item>
            ))}
          </Stack>
        )}
      </CardBody>
      {!hasKeys && (
        <CardFooter className='justify-end'>
          <Button type='button' onClick={onShowKeySelectorDialog}>
            <Lucide.Plus className='size-4' />
            Assign Key
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
