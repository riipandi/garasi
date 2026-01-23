import { getQuery, getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { UpdateAccessKeyParams } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyRequest } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  // Parse router and query parameters
  const params = getQuery<Omit<UpdateAccessKeyParams, 'id'>>(event)
  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('UpdateKey').debug('Key ID not provided')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }
  const body = await readBody<UpdateAccessKeyRequest>(event)

  const data = await gfetch<UpdateAccessKeyResponse>('/v2/UpdateKey', {
    method: 'POST',
    params: { id, ...params },
    body
  })
  logger.withMetadata(data).debug('Updating access key')

  return createResponse<UpdateAccessKeyResponse>(event, 'Update Access Key', { data })
})
