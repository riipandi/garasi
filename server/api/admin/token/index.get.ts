import { defineProtectedHandler } from '~/server/platform/guards'

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
  logger.debug('Listing admin tokens')
  const data = await gfetch<GetAdminTokenInfoResp[]>('/v2/ListAdminTokens')
  logger.withMetadata({ tokenCount: data.length }).debug('Admin tokens listed successfully')
  return { status: 'success', message: 'List Admin Tokens', data }
})
