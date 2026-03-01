import { getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { DeleteAccessKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('DeleteKey')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  await gfetch('/v2/DeleteKey', { method: 'POST', params: { id } })
  log.withMetadata({ id }).debug('Deleting access key')

  return createResponse<DeleteAccessKeyResponse>(event, 'Delete Access Key', {
    data: { accessKeyId: id }
  })
})
