import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'

interface GetAdminTokenInfoResp {
  id: string | null
  created: string | null
  name: string | null
  expiration: string | null
  expired: boolean
  scope: string[]
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ListAdminTokens')
  log.debug('Listing admin tokens')
  const data = await gfetch<GetAdminTokenInfoResp[]>('/v2/ListAdminTokens')
  log.withMetadata(data).debug('Admin tokens listed successfully')
  return createResponse(event, 'List Admin Tokens', { data })
})
