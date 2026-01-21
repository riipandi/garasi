import { defineHandler, getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface KeyPerm {
  allow: object
  deny: object
}

interface UpdateKeyRequest {
  name: string | null
  expiration: string | null
  neverExpires: boolean
}

interface KeyInfoBucketResponse {
  id: string
  name: string
  permissions: KeyPerm
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      logger.debug('Key ID is required')
      throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
    }

    const body = await readBody<UpdateKeyRequest>(event)

    logger.withMetadata({ id, body }).info('Updating access key')
    const data = await gfetch<KeyInfoBucketResponse>('/v2/UpdateKey', {
      method: 'POST',
      params: { id },
      body
    })

    return { status: 'success', message: 'Update Access Key', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
