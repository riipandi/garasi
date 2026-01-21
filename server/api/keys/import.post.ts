import { defineHandler, HTTPError, readBody } from 'nitro/h3'

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

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
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
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
