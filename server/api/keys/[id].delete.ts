import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')

  if (!id) {
    logger.debug('Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  logger.withMetadata({ id }).info('Deleting access key')
  const resp = await gfetch('/v2/DeleteKey', { method: 'POST', params: { id } })

  return { status: 'success', message: 'Delete Access Key', data: { id, ...resp } }
})
