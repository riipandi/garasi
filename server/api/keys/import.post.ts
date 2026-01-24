import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ImportKeyRequest, ImportKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ImportKey')

  const body = await readBody<ImportKeyRequest>(event)

  if (!body?.accessKeyId || !body?.secretAccessKey) {
    log.warn('Access key ID and secret key ID are required')
    throw new HTTPError({ status: 400, statusText: 'Access key ID and secret key ID are required' })
  }

  const data = await gfetch<ImportKeyResponse>('/v2/ImportKey', { method: 'POST', body })
  log.withMetadata({ body, data }).debug('Importing access key')

  return createResponse<ImportKeyResponse>(event, 'Import Key', { data })
})
