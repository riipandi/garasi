import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createS3ClientFromBucket } from '~/server/platform/s3client'

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context

  // Validate required parameter
  const { bucket } = getQuery<{ bucket: string }>(event)
  if (!bucket) {
    logger.debug('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  // Retrieve bucket objects
  const s3Client = await createS3ClientFromBucket(event, bucket)

  // Use delimiter to properly separate folders from files
  // This will return folders in commonPrefixes and files in contents
  const data = await s3Client.list({ maxKeys: 100, fetchOwner: true, delimiter: '/' }, { bucket })

  // Log detailed information for debugging folder recognition
  logger
    .withMetadata({
      bucket,
      objectCount: data?.contents?.length || 0,
      folderCount: data?.commonPrefixes?.length || 0,
      folders: data?.commonPrefixes?.map((p: any) => p.prefix) || [],
      files: data?.contents?.map((obj: any) => obj.key) || []
    })
    .debug('Fetch bucket objects')

  return { status: 'success', message: 'List of bucket objects', data }
})
