import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { DeleteAdminTokenResponse } from '~/shared/schemas/admin-token.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('DeleteAdminToken')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  log.withMetadata({ id }).debug('Deleting admin token')
  await gfetch('/v2/DeleteAdminToken', { method: 'POST', params: { id } })

  return createResponse<DeleteAdminTokenResponse>(event, 'Delete Admin Token', { data: { id } })
})
