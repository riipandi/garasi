import { defineHandler, HTTPError, readBody } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface CreateKeyRequest {
  name: string
}

interface KeyInfoBucketResponse {
  id: string
  name: string
  permissions: object
  created: string | null
  deleted: boolean
}

interface CreateKeyResponse {
  id: string
  name: string
  accessKeyId: string
  secretKeyId: string
  permissions: KeyInfoBucketResponse
  created: string | null
  deleted: boolean
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const body = await readBody<CreateKeyRequest>(event)

    if (!body?.name) {
      logger.debug('Name is required')
      throw new HTTPError({ status: 400, statusText: 'Name is required' })
    }

    logger.withMetadata({ name: body.name }).info('Creating access key')
    const data = await gfetch<CreateKeyResponse>('/v2/CreateKey', {
      method: 'POST',
      body
    })

    return { status: 'success', message: 'Create Access Key', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
