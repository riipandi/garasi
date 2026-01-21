import { getRouterParam, HTTPError, getQuery } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface GetKeyInfoParams {
  search?: string
  secret?: boolean
}

interface KeyInfoBucketResponse {
  id: string
  name: string | null
  permissions: object
  created: string | null
  deleted: boolean
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.debug('Key ID is required')
    throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
  }

  const { search, secret } = getQuery<GetKeyInfoParams>(event)

  logger.withMetadata({ id, search }).info('Getting key information')
  const data = await gfetch<KeyInfoBucketResponse>('/v2/GetKeyInfo', {
    params: { id, search, showSecretKey: secret }
  })

  if (!data) {
    return { success: false, message: 'Access key not found', data: null }
  }

  return { status: 'success', message: 'Get Key Information', data }
})
