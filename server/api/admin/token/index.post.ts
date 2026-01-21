import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

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

interface CreateAdminTokenResp extends GetAdminTokenInfoResp {
  secretToken: string
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    // Parse and validate request body
    const body = await readBody<UpdateAdminTokenRequestBody>(event)
    if (!body?.name) {
      logger.debug('Name of the admin API token is required')
      throw new HTTPError({ status: 400, statusText: 'Name of the admin API token is required' })
    }

    const resp = await gfetch<CreateAdminTokenResp>('/v2/CreateAdminToken', {
      method: 'POST',
      body
    })

    return { status: 'success', message: 'Create Admin Token', data: resp }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
