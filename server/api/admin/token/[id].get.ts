import { HTTPError, getRouterParam, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'

interface GetAdminTokenInfoParams {
  search?: string // Partial token ID or name to search for
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetAdminTokenInfo')

  // Get information from router and query params
  const id = getRouterParam(event, 'id')

  if (!id) {
    log.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  const { search } = getQuery<GetAdminTokenInfoParams>(event)

  log.withMetadata({ id, search }).debug('Getting admin token information')
  const data = await gfetch('/v2/GetAdminTokenInfo', { params: { id, search } })

  if (!data) {
    log.withMetadata({ id }).warn('Admin token not found')
    return createResponse(event, 'Admin token not found', { data: null })
  }

  return createResponse(event, 'Get Admin Token Info', { data })
})
