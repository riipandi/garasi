import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { DeleteBucketResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('DeleteBucket')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  log.withMetadata({ bucketId: id }).debug('Deleting bucket')
  await gfetch('/v2/DeleteBucket', { method: 'POST', params: { id } })

  return createResponse<DeleteBucketResponse>(event, 'Delete Bucket', { data: { id } })
})
