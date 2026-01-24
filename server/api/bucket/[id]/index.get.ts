import { HTTPError, getQuery, getRouterParam } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetBucketInfoParams } from '~/shared/schemas/bucket.schema'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const queryParams = getQuery<Omit<GetBucketInfoParams, 'id'>>(event)

  logger
    .withMetadata({
      bucketId: id,
      search: queryParams.search,
      globalAlias: queryParams.globalAlias
    })
    .debug('Getting bucket information')

  // If search or globalAlias is provided in query params, don't send id to Garage API
  const params = queryParams?.search || queryParams?.globalAlias ? queryParams : { id }
  const data = await gfetch<GetBucketInfoResponse>('/v2/GetBucketInfo', { params })

  return createResponse<GetBucketInfoResponse>(event, 'Get Bucket Information', { data })
})
