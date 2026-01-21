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
    logger.info('Listing admin tokens')
    const data = await gfetch<GetAdminTokenInfoResp[]>('/v2/ListAdminTokens')
    return { status: 'success', message: 'List Admin Tokens', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
