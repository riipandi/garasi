import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { ImportKeyRequest, ImportKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<ImportKeyRequest>(event)

  if (!body?.accessKeyId || !body?.secretAccessKey) {
    const errMsg = 'Access key ID and secret key ID are required'
    logger.withPrefix('ImportKey').withMetadata(body).debug(errMsg)
    throw new HTTPError({ status: 400, statusText: errMsg })
  }

  const data = await gfetch<ImportKeyResponse>('/v2/ImportKey', { method: 'POST', body })
  logger.withMetadata(data).debug('Importing access key')

  return createResponse<ImportKeyResponse>(event, 'Import Key', { data })
})
