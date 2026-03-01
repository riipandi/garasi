import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type {
  UpdateAdminTokenRequest,
  UpdateAdminTokenResponse
} from '~/shared/schemas/admin-token.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('UpdateAdminToken')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  const body = await readBody<UpdateAdminTokenRequest>(event)
  if (!body) {
    log.warn('Request body is required')
    throw new HTTPError({ status: 400, statusText: 'Request body is required' })
  }
  log
    .withMetadata({ id, name: body.name, expiration: body.expiration })
    .debug('Updating admin token')
  const resp = await gfetch<UpdateAdminTokenResponse>('/v2/UpdateAdminToken', {
    method: 'POST',
    params: { id },
    body
  })

  return createResponse<UpdateAdminTokenResponse>(event, 'Update Admin Token', { data: resp })
})
