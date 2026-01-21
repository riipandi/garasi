import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface CreateKeyRequest {
  name: string
  neverExpires: boolean
  expiration: string | null
  allow: { createBucket: boolean } | null
  deny: { createBucket: boolean } | null
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

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<CreateKeyRequest>(event)

  if (!body?.name) {
    logger.debug('Name is required')
    throw new HTTPError({ status: 400, statusText: 'Name is required' })
  }

  logger.withMetadata({ body }).info('Creating access key')
  const data = await gfetch<CreateKeyResponse>('/v2/CreateKey', {
    method: 'POST',
    body
  })

  return { status: 'success', message: 'Create Access Key', data }
})
