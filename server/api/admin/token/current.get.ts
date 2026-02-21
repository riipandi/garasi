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
  const log = logger.withPrefix('GetCurrentAdminToken')

  log.debug('Getting current admin token information')
  const data = await gfetch<GetAdminTokenInfoResp>('/v2/GetCurrentAdminTokenInfo')

  if (!data) {
    log.warn('Current admin token not found')
    return createResponse(event, 'Admin token not found', { data: null })
  }

  return createResponse(event, 'Get Current Admin Token Info', { data })
})
