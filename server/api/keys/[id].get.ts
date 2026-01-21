import { defineHandler, getRouterParam, HTTPError, getQuery } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface GetKeyInfoParams {
  search?: string
}

interface KeyInfoBucketResponse {
  id: string
  name: string | null
  permissions: object
  created: string | null
  deleted: boolean
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      logger.debug('Key ID is required')
      throw new HTTPError({ status: 400, statusText: 'Key ID is required' })
    }

    const { search } = getQuery<GetKeyInfoParams>(event)

    logger.withMetadata({ id, search }).info('Getting key information')
    const data = await gfetch<KeyInfoBucketResponse>('/v2/GetKeyInfo', { params: { id, search } })

    if (!data) {
      return { success: false, message: 'Access key not found', data: null }
    }

    return { status: 'success', message: 'Get Key Information', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
