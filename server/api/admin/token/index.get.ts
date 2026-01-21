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
  logger.info('Listing admin tokens')
  const data = await gfetch<GetAdminTokenInfoResp[]>('/v2/ListAdminTokens')
  return { status: 'success', message: 'List Admin Tokens', data }
})
