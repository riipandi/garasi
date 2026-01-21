import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface GetAdminTokenInfoResp {
  id: string | null
  created: string | null
  name: string | null
  expiration: string | null
  expired: boolean
  scope: string[]
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Getting current admin token information')
    const data = await gfetch<GetAdminTokenInfoResp>('/v2/GetCurrentAdminTokenInfo')

    if (!data) {
      return { success: false, message: 'Admin token not found', data: null }
    }

    return { status: 'success', message: 'Get Current Admin Token Info', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
