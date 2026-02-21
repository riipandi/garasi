import * as Lucide from 'lucide-react'
import { Button } from '~/app/components/button'
import { Card, CardBody, CardHeader, CardTitle } from '~/app/components/card'
import { Text } from '~/app/components/typography'

interface DeleteBucketSectionProps {
  onDeleteBucket: () => void
  objectCount: number
}

export function DeleteBucketSection({ onDeleteBucket, objectCount }: DeleteBucketSectionProps) {
  const hasObjects = objectCount > 0

  return (
    <Card className='border-danger/20'>
      <CardHeader className='bg-danger/5'>
        <Lucide.AlertTriangle className='text-danger size-5' />
        <CardTitle className='text-danger'>Delete Bucket</CardTitle>
      </CardHeader>
      <CardBody className='bg-danger/5 flex items-center justify-between gap-4'>
        <div className='space-y-1'>
          <Text className='text-muted-foreground'>
            This action cannot be undone and will permanently delete this bucket and all its
            contents.
          </Text>
          {hasObjects && (
            <Text className='text-danger'>
              This bucket contains {objectCount} object{objectCount !== 1 ? 's' : ''}. You must
              delete all objects before deleting the bucket.
            </Text>
          )}
        </div>
        <Button type='button' variant='danger' onClick={onDeleteBucket} disabled={hasObjects}>
          <Lucide.Trash2 className='size-4' />
          Delete Bucket
        </Button>
      </CardBody>
    </Card>
  )
}
