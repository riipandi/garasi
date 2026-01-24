import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createS3ClientFromBucket } from '~/server/platform/s3client'

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context

  // Validate required parameter
  const { bucket, prefix } = getQuery<{ bucket: string; prefix?: string }>(event)
  if (!bucket) {
    logger.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  logger.withMetadata({ bucket, prefix }).debug('Listing bucket objects')

  // Retrieve bucket objects
  const s3Client = await createS3ClientFromBucket(event, bucket)

  // Use delimiter to properly separate folders from files
  // This will return folders in commonPrefixes and files in contents
  // If prefix is provided, list objects under that prefix
  const listOptions: any = {
    maxKeys: 100,
    fetchOwner: true,
    delimiter: '/'
  }

  // Add prefix if provided
  if (prefix) {
    listOptions.prefix = prefix
  }

  const data = await s3Client.list(listOptions, { bucket })

  // Log detailed information for debugging folder recognition
  logger
    .withMetadata({
      bucket,
      prefix,
      objectCount: data?.contents?.length || 0,
      folderCount: data?.commonPrefixes?.length || 0
    })
    .debug('Bucket objects listed successfully')

  return { status: 'success', message: 'List of bucket objects', data }
})
