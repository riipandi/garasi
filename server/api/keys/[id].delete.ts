import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('DeleteKey')

  // Parse router and query parameters
  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  const data = await gfetch('/v2/DeleteKey', { method: 'POST', params: { id } })
  log.withMetadata(data).debug('Deleting access key')

  return createResponse(event, 'Delete Access Key', { data })
})
