import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { CheckDomainParams } from '~/shared/schemas/special.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  // Validate required parameter
  const { domain } = getQuery<CheckDomainParams>(event)
  if (!domain) {
    logger.debug('Missing domain parameter')
    throw new HTTPError({ status: 400, statusText: 'Missing domain parameter' })
  }

  const data = await gfetch('/check', { query: { domain } })

  return createResponse(event, 'Check Domain', { data })
})
