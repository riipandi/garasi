import { defineHandler, HTTPError } from 'nitro/h3'

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
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
