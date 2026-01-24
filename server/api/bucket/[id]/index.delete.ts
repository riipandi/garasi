import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('DeleteBucket')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  log.withMetadata({ bucketId: id }).debug('Deleting bucket')
  const data = await gfetch('/v2/DeleteBucket', { method: 'POST', params: { id } })

  return createResponse(event, 'Delete Bucket', { data })
})
