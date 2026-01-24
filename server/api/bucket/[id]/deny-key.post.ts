import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { DenyBucketKeyRequest } from '~/shared/schemas/bucket.schema'
import type { DenyBucketKeyResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const body = await readBody<Omit<DenyBucketKeyRequest, 'bucketId'>>(event)
  if (!body?.accessKeyId) {
    logger.warn('Access Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Access Key ID is required' })
  }
  if (!body?.permissions) {
    logger.warn('Permissions are required')
    throw new HTTPError({ status: 400, statusText: 'Permissions are required' })
  }

  logger.withMetadata({ bucketId: id, accessKeyId: body.accessKeyId }).debug('Denying bucket key')
  const data = await gfetch<DenyBucketKeyResponse>('/v2/DenyBucketKey', {
    method: 'POST',
    body: { ...body, bucketId: id }
  })

  return createResponse<DenyBucketKeyResponse>(event, 'Deny Bucket Key', { data })
})
