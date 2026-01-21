import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface ImportKeyRequest {
  accessKeyId: string
  secretKeyId: string
  name: string | null
}

interface ImportKeyResponse {
  id: string
  name: string
  accessKeyId: string
  secretKeyId: string
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<ImportKeyRequest>(event)

  if (!body?.accessKeyId || !body?.secretKeyId) {
    logger.debug('Access key ID and secret key ID are required')
    throw new HTTPError({
      status: 400,
      statusText: 'Access key ID and secret key ID are required'
    })
  }

  logger.withMetadata({ accessKeyId: body.accessKeyId }).info('Importing access key')
  const data = await gfetch<ImportKeyResponse>('/v2/ImportKey', {
    method: 'POST',
    body
  })

  return { status: 'success', message: 'Import Key', data }
})
