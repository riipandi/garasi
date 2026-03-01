import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'

const DEFAULT_EXPIRY = 3600 // 1 hour

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('PresignUrl')

  // Validate required parameters
  const { bucket, key, operation, contentType, expiresIn } = getQuery<{
    bucket: string
    key: string
    operation: 'get' | 'put'
    contentType?: string
    expiresIn?: string
  }>(event)

  if (!bucket) {
    log.warn('Missing bucket parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing bucket parameter' })
  }

  if (!key) {
    log.warn('Missing key parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing key parameter' })
  }

  if (!operation) {
    log.warn('Missing operation parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing operation parameter' })
  }

  if (operation === 'put' && !contentType) {
    log.warn('contentType required for PUT operation')
    throw new HTTPError({
      status: 400,
      statusText: 'contentType is required for PUT operation'
    })
  }

  log.withMetadata({ bucket, key, operation }).debug('Generating presigned URL')

  // Create S3 service for the bucket
  const s3Client = await S3Service.fromBucket(event, bucket)

  // Parse expiry (default: 1 hour)
  const expiry = expiresIn ? parseInt(expiresIn, 10) : DEFAULT_EXPIRY

  // Validate expiry range (1 minute to 7 days)
  if (expiry < 60 || expiry > 604800) {
    throw new HTTPError({
      status: 400,
      statusText: 'expiresIn must be between 60 (1 min) and 604800 (7 days) seconds'
    })
  }

  // Generate presigned URL based on operation type
  let url: string
  if (operation === 'get') {
    url = await s3Client.presignGet(key, expiry)
  } else {
    url = await s3Client.presignPut(key, contentType!, expiry)
  }

  log.withMetadata({ bucket, key, operation, expiry }).info('Presigned URL generated')

  const data = {
    url,
    key,
    operation,
    expires_in: expiry,
    expires_at: new Date(Date.now() + expiry * 1000).toISOString()
  }

  return createResponse(event, 'Presigned URL generated', { data })
})
