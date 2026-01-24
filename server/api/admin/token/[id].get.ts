import { HTTPError, getRouterParam, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface GetAdminTokenInfoParams {
  search?: string // Partial token ID or name to search for
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  // Get information from router and query params
  const id = getRouterParam(event, 'id')

  if (!id) {
    logger.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  const { search } = getQuery<GetAdminTokenInfoParams>(event)

  logger.withMetadata({ id, search }).debug('Getting admin token information')
  const data = await gfetch('/v2/GetAdminTokenInfo', { params: { id, search } })

  if (!data) {
    logger.withMetadata({ id }).warn('Admin token not found')
    return { success: false, message: 'Admin token not found', data: null }
  }

  return { status: 'success', message: 'Get Admin Token Info', data }
})
