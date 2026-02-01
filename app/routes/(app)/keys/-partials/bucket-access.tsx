import * as Lucide from 'lucide-react'
import { Badge } from '~/app/components/badge'
import { Button } from '~/app/components/button'
import { Checkbox } from '~/app/components/checkbox'
import { Fieldset, FieldsetLegend } from '~/app/components/fieldset'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '~/app/components/item'
import { Spinner } from '~/app/components/spinner'
import { Stack } from '~/app/components/stack'
import { Text } from '~/app/components/typography'
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
    <Fieldset>
      <div className='flex items-center justify-between'>
        <FieldsetLegend>
          <Lucide.Database className='size-4' />
          Bucket Access
        </FieldsetLegend>
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
      </div>

      <Text className='text-muted'>
        Select buckets you'd like to give this access key permission to access.
      </Text>

      {isLoadingPermissions || isLoadingBuckets ? (
        <div className='flex items-center justify-center py-8'>
          <Spinner />
        </div>
      ) : buckets.length === 0 ? (
        <div className='flex flex-col items-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-8 text-center'>
          <Lucide.Database className='mb-4 size-12 text-gray-400' />
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
                <div className='flex items-start gap-3'>
                  <Checkbox
                    id={`bucket-${bucket.id}`}
                    checked={isSelected}
                    onCheckedChange={() => onBucketToggle(bucket.id)}
                    className='mt-1'
                  />
                  <div className='flex-1'>
                    <div
                      className={`rounded-lg border bg-white p-4 transition-all ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <Item variant='plain' className='p-0'>
                        <ItemMedia>
                          <Lucide.Database className='size-5 text-gray-500' />
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>
                            <code className='font-mono text-sm'>{bucket.id}</code>
                          </ItemTitle>
                          <ItemDescription>
                            {bucket.globalAliases.length > 0 ? (
                              <div className='flex flex-wrap gap-1'>
                                {bucket.globalAliases.map((alias) => (
                                  <Badge key={alias} variant='tertiary-outline'>
                                    <Lucide.Globe className='mr-1 size-3' />
                                    {alias}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span>No aliases</span>
                            )}
                          </ItemDescription>
                        </ItemContent>
                      </Item>

                      {isSelected && (
                        <div className='mt-4 space-y-3 border-t border-gray-200 pt-4'>
                          <Text className='text-xs font-medium'>Permissions:</Text>
                          <div className='flex flex-wrap gap-3'>
                            <span className='flex items-center gap-2 text-sm'>
                              <Checkbox
                                checked={permissions.read}
                                onCheckedChange={(checked) =>
                                  onPermissionChange(bucket.id, 'read', checked === true)
                                }
                              />
                              <span>Read</span>
                            </span>
                            <span className='flex items-center gap-2 text-sm'>
                              <Checkbox
                                checked={permissions.write}
                                onCheckedChange={(checked) =>
                                  onPermissionChange(bucket.id, 'write', checked === true)
                                }
                              />
                              <span>Write</span>
                            </span>
                            <span className='flex items-center gap-2 text-sm'>
                              <Checkbox
                                checked={permissions.owner}
                                onCheckedChange={(checked) =>
                                  onPermissionChange(bucket.id, 'owner', checked === true)
                                }
                              />
                              <span>Owner</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </Stack>
      )}
    </Fieldset>
  )
}
