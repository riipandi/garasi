import { defineHandler, getRouterParam, HTTPError, readBody } from 'nitro/h3'

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

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      logger.debug('Token ID is required')
      throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
    }

    const body = await readBody<UpdateAdminTokenRequestBody>(event)
    const resp = await gfetch<GetAdminTokenInfoResp>('/v2/UpdateAdminToken', {
      method: 'POST',
      params: { id },
      body
    })

    return { status: 'success', message: 'Update Admin Token', data: resp }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
