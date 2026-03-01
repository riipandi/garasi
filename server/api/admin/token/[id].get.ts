import { HTTPError, getRouterParam, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type {
  GetAdminTokenInfoParams,
  GetAdminTokenInfoResponse
} from '~/shared/schemas/admin-token.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('GetAdminTokenInfo')

  const id = getRouterParam(event, 'id')

  if (!id) {
    log.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  const { search } = getQuery<GetAdminTokenInfoParams>(event)

  log.withMetadata({ id, search }).debug('Getting admin token information')
  const data = await gfetch<GetAdminTokenInfoResponse>('/v2/GetAdminTokenInfo', {
    params: { id, search }
  })

  if (!data) {
    log.withMetadata({ id }).warn('Admin token not found')
    return createResponse<GetAdminTokenInfoResponse>(event, 'Admin token not found', { data: null })
  }

  return createResponse<GetAdminTokenInfoResponse>(event, 'Get Admin Token Info', { data })
})
