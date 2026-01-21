import { defineHandler, getRouterParam, HTTPError, readBody } from 'nitro/h3'

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
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
