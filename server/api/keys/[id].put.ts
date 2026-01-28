import { getQuery, getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { UpdateAccessKeyParams } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyRequest } from '~/shared/schemas/keys.schema'
import type { UpdateAccessKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('UpdateKey')

  const id = getRouterParam(event, 'id')

  if (!id) {
    log.warn('Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  const params = getQuery<Omit<UpdateAccessKeyParams, 'id'>>(event)

  const body = await readBody<UpdateAccessKeyRequest>(event)

  if (!body) {
    log.warn('Request body is required')
    throw new HTTPError({ status: 400, statusText: 'Request body is required' })
  }

  const data = await gfetch<UpdateAccessKeyResponse>('/v2/UpdateKey', {
    method: 'POST',
    params: { id, ...params },
    body
  })
  log.withMetadata(data).debug('Updating access key')

  return createResponse<UpdateAccessKeyResponse>(event, 'Update Access Key', { data })
})
