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
  const data = await s3Client.list({ maxKeys: 100, fetchOwner: true }, { bucket })
  logger.withMetadata(data).debug('Fetch bucket objects')

  return { status: 'success', message: 'List of bucket objects', data }
})
