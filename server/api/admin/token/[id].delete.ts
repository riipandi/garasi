import { defineHandler, getQuery, getRouterParam, HTTPError } from 'nitro/h3'

interface DeleteAdminTokenParams {
  search: string
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      logger.debug('Token ID is required')
      throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
    }

    const { search } = getQuery<DeleteAdminTokenParams>(event)
    const resp = await gfetch('/v2/DeleteAdminToken', { method: 'POST', params: { id, search } })

    return { status: 'success', message: 'Delete Admin Token', data: { id, ...resp } }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
