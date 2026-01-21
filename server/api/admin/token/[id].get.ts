import { defineHandler, HTTPError, getRouterParam, getQuery } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface GetAdminTokenInfoParams {
  search?: string // Partial token ID or name to search for
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    // Get information from router and query params
    const id = getRouterParam(event, 'id')

    if (!id) {
      logger.debug('Token ID is required')
      throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
    }

    const { search } = getQuery<GetAdminTokenInfoParams>(event)

    logger.withMetadata({ id }).info('Getting admin token information')
    const data = await gfetch('/v2/GetAdminTokenInfo', { params: { id, search } })

    if (!data) {
      return { success: false, message: 'Admin token not found', data: null }
    }

    return { status: 'success', message: 'Get Admin Token Info', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
