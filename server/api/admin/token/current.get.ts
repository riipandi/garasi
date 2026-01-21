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
    logger.info('Getting current admin token information')
    const data = await gfetch<GetAdminTokenInfoResp>('/v2/GetCurrentAdminTokenInfo')

    if (!data) {
      return { success: false, message: 'Admin token not found', data: null }
    }

    return { status: 'success', message: 'Get Current Admin Token Info', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
