import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('ListBucketObjects')

  // Validate required parameter
  const { bucket, prefix } = getQuery<{ bucket: string; prefix?: string }>(event)
  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  log.withMetadata({ bucket, prefix }).debug('Listing bucket objects')

  // Retrieve bucket objects
  const s3Client = await S3Service.fromBucket(event, bucket)

  // Use delimiter to properly separate folders from files
  // This will return folders in commonPrefixes and files in contents
  // If prefix is provided, list objects under that prefix
  const data = await s3Client.list(prefix, {
    delimiter: '/',
    maxKeys: 100
  })

  // Log detailed information for debugging folder recognition
  log
    .withMetadata({
      bucket,
      prefix,
      objectCount: data?.contents?.length || 0,
      folderCount: data?.common_prefixes?.length || 0
    })
    .debug('Bucket objects listed successfully')

  return createResponse(event, 'List of bucket objects', { data })
})
