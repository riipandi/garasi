import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetCurrentTokenInfoResponse } from '~/shared/schemas/admin-token.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetCurrentAdminToken')

  log.debug('Getting current admin token information')
  const data = await gfetch<GetCurrentTokenInfoResponse>('/v2/GetCurrentAdminTokenInfo')

  if (!data) {
    log.warn('Current admin token not found')
    return createResponse<GetCurrentTokenInfoResponse>(event, 'Admin token not found', {
      data: null
    })
  }

  return createResponse<GetCurrentTokenInfoResponse>(event, 'Get Current Admin Token Info', {
    data
  })
})
