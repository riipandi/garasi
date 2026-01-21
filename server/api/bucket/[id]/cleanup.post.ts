import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface CleanupIncompleteUploadsRequestBody {
  olderThanSecs: number // Number of seconds; incomplete uploads older than this will be deleted
}

interface CleanupIncompleteUploadsResponse {
  uploadsDeleted: number // Number of incomplete multipart uploads deleted
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const body = await readBody<CleanupIncompleteUploadsRequestBody>(event)

  if (typeof body?.olderThanSecs !== 'number' || body.olderThanSecs < 0) {
    logger.debug('olderThanSecs must be a non-negative number')
    throw new HTTPError({
      status: 400,
      statusText: 'olderThanSecs must be a non-negative number'
    })
  }

  logger.withMetadata({ bucketId: id, body }).info('Cleaning up incomplete uploads')
  const data = await gfetch<CleanupIncompleteUploadsResponse>('/v2/CleanupIncompleteUploads', {
    method: 'POST',
    body: { ...body, bucketId: id }
  })

  return { status: 'success', message: 'Cleanup Incomplete Uploads', data }
})
