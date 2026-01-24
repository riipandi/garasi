import { getQuery, getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { RemoveBucketAliasRequest } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketAliasResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('RemoveBucketAlias').debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const params = getQuery<Omit<RemoveBucketAliasRequest, 'bucketId'>>(event)
  if (!params?.globalAlias) {
    logger.withPrefix('RemoveBucketAlias').debug('Global alias is required')
    throw new HTTPError({ status: 400, statusText: 'Global alias is required' })
  }

  const data = await gfetch<RemoveBucketAliasResponse>('/v2/RemoveBucketAlias', {
    method: 'POST',
    body: { ...params, bucketId: id }
  })
  logger.withMetadata(data).debug('Removing bucket alias')

  return createResponse<RemoveBucketAliasResponse>(event, 'Remove Bucket Alias', { data })
})
