import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

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

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  const body = await readBody<UpdateAdminTokenRequestBody>(event)
  if (!body) {
    logger.warn('Request body is required')
    throw new HTTPError({ status: 400, statusText: 'Request body is required' })
  }
  logger
    .withMetadata({ id, name: body.name, expiration: body.expiration })
    .debug('Updating admin token')
  const resp = await gfetch<GetAdminTokenInfoResp>('/v2/UpdateAdminToken', {
    method: 'POST',
    params: { id },
    body
  })

  return { status: 'success', message: 'Update Admin Token', data: resp }
})
