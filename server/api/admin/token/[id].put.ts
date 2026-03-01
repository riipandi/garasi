import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'

interface UpdateAdminTokenRequestBody {
  name: string | null // Name of the admin API token
  expiration: string | null // Expiration time and date (RFC3339)
  neverExpires: boolean // Set the admin token to never expire
  scope: string[] | null // Scope of the admin API token, a list of admin endpoint names
}

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
  const log = logger.withPrefix('UpdateAdminToken')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  const body = await readBody<UpdateAdminTokenRequestBody>(event)
  if (!body) {
    log.warn('Request body is required')
    throw new HTTPError({ status: 400, statusText: 'Request body is required' })
  }
  log
    .withMetadata({ id, name: body.name, expiration: body.expiration })
    .debug('Updating admin token')
  const resp = await gfetch<GetAdminTokenInfoResp>('/v2/UpdateAdminToken', {
    method: 'POST',
    params: { id },
    body
  })

  return createResponse(event, 'Update Admin Token', { data: resp })
})
