import { Link } from '@tanstack/react-router'
import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '~/app/components/card'
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
import { clx } from '~/app/utils'
import type { ApiBucketKeyPerm } from '~/shared/schemas/bucket.schema'

interface BucketAccessSectionProps {
  buckets: Array<{ id: string; created: string; globalAliases: string[] }>
  bucketPermissions: Record<string, ApiBucketKeyPerm>
  isLoadingPermissions: boolean
  isLoadingBuckets: boolean
}

export function BucketAccessSection({
  buckets,
  bucketPermissions,
  isLoadingPermissions,
  isLoadingBuckets
}: BucketAccessSectionProps) {
  const isLoading = isLoadingPermissions || isLoadingBuckets

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bucket Access</CardTitle>
        <CardDescription>View which buckets this access key can access.</CardDescription>
      </CardHeader>
      <CardBody className='p-12'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Lucide.Loader2 className='text-dimmed mb-4 size-12 animate-spin' />
            <Text className='text-muted-foreground'>Loading buckets...</Text>
          </div>
        ) : buckets.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Lucide.Database className='text-dimmed mb-4 size-12' />
            <Text className='text-dimmed mb-4'>No buckets found</Text>
            <Text className='text-muted-foreground mb-6'>
              Create a bucket first to assign access permissions.
            </Text>
          </div>
        ) : (
          <Stack spacing='md'>
            {buckets.map((bucket) => {
              const permissions = bucketPermissions[bucket.id]
              const hasAccess = !!permissions

              return (
                <Item key={bucket.id}>
                  <ItemMedia>
                    <div
                      className={clx(
                        'flex size-10 items-center justify-center rounded-full',
                        hasAccess ? 'bg-blue-100' : 'bg-dimmed/5'
                      )}
                    >
                      <Lucide.Database
                        className={clx('size-5', hasAccess ? 'text-blue-600' : 'text-dimmed')}
                      />
                    </div>
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>
                      <code className='font-mono text-sm'>{bucket.id}</code>
                    </ItemTitle>
                    {bucket.globalAliases.length > 0 && (
                      <ItemDescription className='flex flex-wrap gap-1 pt-1'>
                        {bucket.globalAliases.map((alias) => (
                          <Badge key={alias} variant='info-outline' size='sm'>
                            <Lucide.Globe className='mr-1 size-3' />
                            {alias}
                          </Badge>
                        ))}
                      </ItemDescription>
                    )}
                  </ItemContent>
                  <ItemAction>
                    {hasAccess ? (
                      <>
                        <div className='flex items-center gap-4'>
                          {permissions.owner && (
                            <Badge variant='primary' size='sm' pill>
                              Owner
                            </Badge>
                          )}
                          {permissions.read && !permissions.owner && (
                            <Badge variant='info' size='sm' pill>
                              Read
                            </Badge>
                          )}
                          {permissions.write && !permissions.owner && (
                            <Badge variant='success' size='sm' pill>
                              Write
                            </Badge>
                          )}
                        </div>
                        <Separator orientation='vertical' className='mx-4' />
                      </>
                    ) : null}
                    <Button
                      size='sm'
                      variant='outline'
                      nativeButton={false}
                      render={
                        <Link
                          to='/buckets/$id/settings'
                          params={{ id: bucket.id }}
                          search={{ prefix: undefined, key: undefined }}
                        />
                      }
                    >
                      <Lucide.Settings2 className='size-4' />
                      <span className='sr-only'>Configure</span>
                    </Button>
                  </ItemAction>
                </Item>
              )
            })}
          </Stack>
        )}
      </CardBody>
    </Card>
  )
}
