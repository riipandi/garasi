import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.warn('Token ID is required')
    throw new HTTPError({ status: 400, statusText: 'Token ID is required' })
  }

  logger.withMetadata({ id }).debug('Deleting admin token')
  const resp = await gfetch('/v2/DeleteAdminToken', { method: 'POST', params: { id } })

  return { status: 'success', message: 'Delete Admin Token', data: { id, ...resp } }
})
