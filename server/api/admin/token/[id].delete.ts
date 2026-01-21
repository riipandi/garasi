import { defineHandler, getRouterParam, HTTPError } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      logger.debug('Token ID is required')
      throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
    }

    const resp = await gfetch('/v2/DeleteAdminToken', { method: 'POST', params: { id } })

    return { status: 'success', message: 'Delete Admin Token', data: { id, ...resp } }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
