import { defineHandler, getRouterParam, HTTPError } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      logger.debug('Key ID is required')
      throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
    }

    logger.withMetadata({ id }).info('Deleting access key')
    const resp = await gfetch('/v2/DeleteKey', { method: 'POST', params: { id } })

    return { status: 'success', message: 'Delete Access Key', data: { id, ...resp } }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
