import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('DeleteAdminToken')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  log.withMetadata({ id }).debug('Deleting admin token')
  const resp = await gfetch('/v2/DeleteAdminToken', { method: 'POST', params: { id } })

  return createResponse(event, 'Delete Admin Token', { data: { id, ...resp } })
})
