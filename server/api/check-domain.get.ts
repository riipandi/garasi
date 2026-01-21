import { defineHandler, getQuery, HTTPError } from 'nitro/h3'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    // Validate required parameter
    const { domain } = getQuery<{ domain: string }>(event)
    if (!domain) {
      logger.debug('Missing domain parameter')
      throw new HTTPError({ status: 400, statusText: 'Missing domain parameter' })
    }

    const data = await gfetch('/check', { query: { domain } })

    return { status: 'success', message: 'Check Domain', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
