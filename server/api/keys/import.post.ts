import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse, createErrorResonse } from '~/server/platform/responder'
import type { ImportKeyRequest, ImportKeyResponse } from '~/shared/schemas/keys.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('ImportKey')

  try {
    const body = await readBody<ImportKeyRequest>(event)

    if (!body?.accessKeyId || body.accessKeyId.trim() === '') {
      log.warn('Access key ID is required')
      throw new HTTPError({ status: 400, statusText: 'Access key ID is required' })
    }

    if (!body?.secretAccessKey || body.secretAccessKey.trim() === '') {
      log.warn('Secret access key is required')
      throw new HTTPError({ status: 400, statusText: 'Secret access key is required' })
    }

    log
      .withMetadata({ accessKeyId: body.accessKeyId, name: body.name })
      .debug('Importing access key')

    const requestBody: ImportKeyRequest = {
      accessKeyId: body.accessKeyId,
      secretAccessKey: body.secretAccessKey,
      name: body.name || null
    }

    const data = await gfetch<ImportKeyResponse>('/v2/ImportKey', {
      method: 'POST',
      body: requestBody
    })

    log.withMetadata(data).debug('Access key imported successfully')

    return createResponse<ImportKeyResponse>(event, 'Access key imported successfully', {
      statusCode: 201,
      data
    })
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
