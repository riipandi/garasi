import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { CleanupUploadsRequest } from '~/shared/schemas/bucket.schema'
import type { CleanupUploadsResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('CleanupUploads').debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const body = await readBody<Omit<CleanupUploadsRequest, 'bucketId'>>(event)

  if (typeof body?.olderThanSecs !== 'number' || body.olderThanSecs < 0) {
    logger.withPrefix('CleanupUploads').debug('olderThanSecs must be a non-negative number')
    throw new HTTPError({
      status: 400,
      statusText: 'olderThanSecs must be a non-negative number'
    })
  }

  const data = await gfetch<CleanupUploadsResponse>('/v2/CleanupIncompleteUploads', {
    method: 'POST',
    body: { ...body, bucketId: id }
  })
  logger.withMetadata(data).debug('Cleaning up incomplete uploads')

  return createResponse<CleanupUploadsResponse>(event, 'Cleanup Incomplete Uploads', { data })
})
