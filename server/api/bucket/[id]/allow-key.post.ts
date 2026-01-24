import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { AllowBucketKeyRequest } from '~/shared/schemas/bucket.schema'
import type { AllowBucketKeyResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('AllowBucketKey').debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const body = await readBody<Omit<AllowBucketKeyRequest, 'bucketId'>>(event)
  if (!body?.accessKeyId) {
    logger.withPrefix('AllowBucketKey').debug('Access Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Access Key ID is required' })
  }
  if (!body?.permissions) {
    logger.withPrefix('AllowBucketKey').debug('Permissions are required')
    throw new HTTPError({ status: 400, statusText: 'Permissions are required' })
  }

  const data = await gfetch<AllowBucketKeyResponse>('/v2/AllowBucketKey', {
    method: 'POST',
    body: { ...body, bucketId: id }
  })
  logger.withMetadata(data).debug('Allowing bucket key')

  return createResponse<AllowBucketKeyResponse>(event, 'Allow Bucket Key', { data })
})
