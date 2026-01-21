import { defineHandler, getQuery, HTTPError } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

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
    return createErrorResonse(event, error)
  }
})
