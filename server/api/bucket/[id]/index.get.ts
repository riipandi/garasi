import { HTTPError, getQuery, getRouterParam } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { GetBucketInfoParams } from '~/shared/schemas/bucket.schema'
import type { GetBucketInfoResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('GetBucketInfo').debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const queryParams = getQuery<Omit<GetBucketInfoParams, 'id'>>(event)

  // If search or globalAlias is provided in query params, don't send id to Garage API
  const params = queryParams?.search || queryParams?.globalAlias ? queryParams : { id }
  const data = await gfetch<GetBucketInfoResponse>('/v2/GetBucketInfo', { params })

  logger.withMetadata(data).debug('Getting bucket information')

  return createResponse<GetBucketInfoResponse>(event, 'Get Bucket Information', { data })
})
