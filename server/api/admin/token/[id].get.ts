import { defineHandler, HTTPError, getRouterParam, getQuery } from 'nitro/h3'

interface GetAdminTokenInfoParams {
  search: string
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    // Get information from router and query params
    const id = getRouterParam(event, 'id')
    const { search } = getQuery<GetAdminTokenInfoParams>(event)

    if (!id) {
      logger.debug('Token ID is required')
      throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
    }

    logger.withMetadata({ id, search }).info('Getting admin token information')
    const data = await gfetch('/v2/GetAdminTokenInfo', { params: { id, search } })

    if (!data) {
      return { success: false, message: 'Admin token not found', data: null }
    }

    return { status: 'success', message: 'Get Admin Token Info', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
