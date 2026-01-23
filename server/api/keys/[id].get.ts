import { getRouterParam, HTTPError, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetKeyInformationParams } from '~/shared/schemas/keys.schema'
import type { GetKeyInformationResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  // Parse router and query parameters
  const params = getQuery<Omit<GetKeyInformationParams, 'id'>>(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('GetKeyInfo').debug('Key ID not provided')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  const data = await gfetch<GetKeyInformationResponse>('/v2/GetKeyInfo', {
    params: { id, ...params }
  })
  logger.withMetadata(data).debug('Getting key information')

  return createResponse<GetKeyInformationResponse>(event, 'Get Key Information', { data })
})
