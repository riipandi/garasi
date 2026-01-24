import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { UpdateBucketRequest } from '~/shared/schemas/bucket.schema'
import type { UpdateBucketResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const body = await readBody<UpdateBucketRequest>(event)
  if (!body?.websiteAccess && !body?.quotas) {
    logger.warn('Either websiteAccess or quotas is required')
    throw new HTTPError({ status: 400, statusText: 'Either websiteAccess or quotas is required' })
  }

  logger.withMetadata({ bucketId: id }).debug('Updating bucket')
  const data = await gfetch<UpdateBucketResponse>('/v2/UpdateBucket', {
    method: 'POST',
    params: { id },
    body
  })

  return createResponse<UpdateBucketResponse>(event, 'Update Bucket', { data })
})
