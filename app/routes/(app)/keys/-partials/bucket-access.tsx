import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardHeaderAction, CardTitle } from '~/app/components/card'
import { Checkbox } from '~/app/components/checkbox'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
import { clx } from '~/app/utils'
import type { ApiBucketKeyPerm } from '~/shared/schemas/bucket.schema'

interface BucketAccessSectionProps {
  buckets: Array<{ id: string; created: string; globalAliases: string[] }>
  selectedBuckets: Set<string>
  bucketPermissions: Record<string, ApiBucketKeyPerm>
  isLoadingPermissions: boolean
  isLoadingBuckets: boolean
  isSaving: boolean
  onBucketToggle: (bucketId: string) => void
  onPermissionChange: (bucketId: string, permission: keyof ApiBucketKeyPerm, value: boolean) => void
  onSavePermissions: () => void
}

export function BucketAccessSection({
  buckets,
  selectedBuckets,
  bucketPermissions,
  isLoadingPermissions,
  isLoadingBuckets,
  isSaving,
  onBucketToggle,
  onPermissionChange,
  onSavePermissions
}: BucketAccessSectionProps) {
  return (
    <Card>
      <CardHeader>
        <Lucide.Database className='text-muted size-5' />
        <CardTitle>Bucket Access</CardTitle>
        <CardHeaderAction className='sr-only'>
          <Button size='sm' onClick={onSavePermissions} disabled={isSaving || isLoadingPermissions}>
            {isSaving ? (
              <>
                <Spinner className='size-4' />
                Saving...
              </>
            ) : (
              <>
                <Lucide.Save className='size-4' />
                Save Changes
              </>
            )}
          </Button>
        </CardHeaderAction>
      </CardHeader>
      <CardBody className='space-y-4'>
        <Text className='text-muted'>
          Select buckets you would like to give this access key permission to access.
        </Text>

        {isLoadingPermissions || isLoadingBuckets ? (
          <div className='flex items-center justify-center py-8'>
            <Spinner />
          </div>
        ) : buckets.length === 0 ? (
          <div className='border-input bg-background flex flex-col items-center rounded-lg border-2 border-dashed p-8 text-center'>
            <Lucide.Database className='text-muted mb-4 size-12' />
            <Text className='font-medium'>No buckets found</Text>
            <Text className='text-muted'>Create a bucket first to assign access permissions.</Text>
          </div>
        ) : (
          <Stack>
            {buckets.map((bucket) => {
              const isSelected = selectedBuckets.has(bucket.id)
              const permissions = bucketPermissions[bucket.id] || {
                read: true,
                write: false,
                owner: false
              }

              return (
                <div key={bucket.id}>
                  <div
                    className={clx(
                      'bg-background rounded-lg border p-4 transition-all',
                      isSelected ? 'border-blue-300 bg-blue-50' : 'border-input'
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      <Checkbox
                        id={`bucket-${bucket.id}`}
                        checked={isSelected}
                        onCheckedChange={() => onBucketToggle(bucket.id)}
                        className='mt-1'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <code className='font-mono text-sm'>{bucket.id}</code>
                            {bucket.globalAliases.length > 0 && (
                              <div className='mt-1 flex flex-wrap gap-1'>
                                {bucket.globalAliases.map((alias) => (
                                  <Badge key={alias} variant='tertiary-outline'>
                                    <Lucide.Globe className='mr-1 size-3' />
                                    {alias}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className='flex items-center gap-3'>
                              <span className='flex items-center gap-1.5 text-sm'>
                                <Checkbox
                                  checked={permissions.read}
                                  onCheckedChange={(checked) =>
                                    onPermissionChange(bucket.id, 'read', checked === true)
                                  }
                                />
                                <span>Read</span>
                              </span>
                              <span className='flex items-center gap-1.5 text-sm'>
                                <Checkbox
                                  checked={permissions.write}
                                  onCheckedChange={(checked) =>
                                    onPermissionChange(bucket.id, 'write', checked === true)
                                  }
                                />
                                <span>Write</span>
                              </span>
                              <span className='flex items-center gap-1.5 text-sm'>
                                <Checkbox
                                  checked={permissions.owner}
                                  onCheckedChange={(checked) =>
                                    onPermissionChange(bucket.id, 'owner', checked === true)
                                  }
                                />
                                <span>Owner</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Stack>
        )}
      </CardBody>
    </Card>
  )
}
