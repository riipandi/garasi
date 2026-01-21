import { defineHandler, HTTPError, getQuery, readBody } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { node } = getQuery<{ node: string }>(event)

    if (!node) {
      logger.debug('Node parameter is required')
      throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
    }

    const body = await readBody(event)

    if (!body) {
      logger.debug('Request body is required')
      throw new HTTPError({ status: 400, statusText: 'Request body is required' })
    }

    logger.withMetadata({ node, body }).info('Retrying block resync')
    const data = await gfetch('/v2/RetryBlockResync', {
      method: 'POST',
      params: { node },
      body
    })

    return { status: 'success', message: 'Retry Block Resync', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
