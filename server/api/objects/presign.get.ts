import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import { S3Service } from '~/server/platform/s3client'
import type { PresignUrlResponse } from '~/shared/schemas/objects.schema'

const DEFAULT_EXPIRY = 3600 // 1 hour

export default defineProtectedHandler(async (event) => {
  const { logger } = event.context
  const log = logger.withPrefix('PresignUrl')

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

  const s3Client = await S3Service.fromBucket(event, bucket)

  const expires_in = expiresIn ? parseInt(expiresIn, 10) : DEFAULT_EXPIRY

  if (expires_in < 60 || expires_in > 604800) {
    throw new HTTPError({
      status: 400,
      statusText: 'expiresIn must be between 60 (1 min) and 604800 (7 days) seconds'
    })
  }

  let url: string
  if (operation === 'get') {
    url = await s3Client.presignGet(key, expires_in)
  } else {
    url = await s3Client.presignPut(key, contentType!, expires_in)
  }

  const expires_at = new Date(Date.now() + expires_in * 1000).toISOString()
  log.withMetadata({ bucket, key, operation, expires_in }).info('Presigned URL generated')

  return createResponse<PresignUrlResponse>(event, 'Presigned URL generated', {
    data: { url, key, operation, expires_in, expires_at }
  })
})
