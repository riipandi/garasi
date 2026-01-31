import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
import { IconBox } from '~/app/components/icon-box'
import { Text } from '~/app/components/typography'
import { Heading } from '~/app/components/typography'

interface DeleteBucketSectionProps {
  onDeleteBucket: () => void
  objectCount: number
}

export function DeleteBucketSection({ onDeleteBucket, objectCount }: DeleteBucketSectionProps) {
  const hasObjects = objectCount > 0

  return (
    <div className='border-danger/20 bg-danger/5 flex items-center justify-between rounded-lg border p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <IconBox variant='danger' size='md' circle>
          <Lucide.AlertTriangle className='size-5' />
        </IconBox>
        <div>
          <Heading level={3} className='text-danger'>
            Delete Bucket
          </Heading>
          <Text className='text-danger text-sm'>
            This action cannot be undone and will delete all objects
          </Text>
          {hasObjects && (
            <Text className='text-danger/80 mt-1 text-xs'>
              This bucket contains {objectCount} object{objectCount !== 1 ? 's' : ''}. You must
              delete all objects before deleting bucket.
            </Text>
          )}
        </div>
      </div>
      <Button type='button' variant='danger' onClick={onDeleteBucket} disabled={hasObjects}>
        <Lucide.Trash2 className='size-4' />
        Delete Bucket
      </Button>
    </div>
  )
}
