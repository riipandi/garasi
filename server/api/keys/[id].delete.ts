import { getQuery, getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { DeleteAccessKeyParams } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  // Parse router and query parameters
  const params = getQuery<Omit<DeleteAccessKeyParams, 'id'>>(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('DeleteKey').debug('Key ID not provided')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  const data = await gfetch('/v2/DeleteKey', { method: 'POST', params: { id, ...params } })
  logger.withMetadata(data).info('Deleting access key')

  return createResponse(event, 'Delete Access Key', { data })
})
