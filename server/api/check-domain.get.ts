import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  // Validate required parameter
  const { domain } = getQuery<{ domain: string }>(event)
  if (!domain) {
    logger.debug('Missing domain parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing domain parameter' })
  }

  const data = await gfetch('/check', { query: { domain } })

  return { status: 'success', message: 'Check Domain', data }
})
