import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { CreateAccessKeyRequest, CreateAccessKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('CreateKey')

  const body = await readBody<CreateAccessKeyRequest>(event)
  if (!body?.name) {
    log.warn('Name is required')
    throw new HTTPError({ status: 400, statusText: 'Name is required' })
  }

  const data = await gfetch<CreateAccessKeyResponse>('/v2/CreateKey', { method: 'POST', body })
  log.withMetadata({ body, data }).debug('Creating access key')

  return createResponse(event, 'Create Access Key', { data })
})
