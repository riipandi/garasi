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

  logger.debug('Getting current admin token information')
  const data = await gfetch<GetAdminTokenInfoResp>('/v2/GetCurrentAdminTokenInfo')

  if (!data) {
    logger.warn('Current admin token not found')
    return { success: false, message: 'Admin token not found', data: null }
  }

  return { status: 'success', message: 'Get Current Admin Token Info', data }
})
