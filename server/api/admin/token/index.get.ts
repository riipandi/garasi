import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ListAdminTokensResponse } from '~/shared/schemas/admin-token.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ListAdminTokens')
  log.debug('Listing admin tokens')
  const data = await gfetch<ListAdminTokensResponse[]>('/v2/ListAdminTokens')
  log.withMetadata(data).debug('Admin tokens listed successfully')
  return createResponse<ListAdminTokensResponse[]>(event, 'List Admin Tokens', { data })
})
