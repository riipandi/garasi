import { defineHandler, getRouterParam, HTTPError } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      logger.debug('Bucket ID is required')
      throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
    }

    logger.withMetadata({ id }).info('Deleting bucket')
    await gfetch('/v2/DeleteBucket', { method: 'POST', params: { id } })

    return { status: 'success', message: 'Delete Bucket', data: { id } }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
