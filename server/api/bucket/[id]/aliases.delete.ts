import { getQuery, getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { RemoveBucketAliasRequest } from '~/shared/schemas/bucket.schema'
import type { RemoveBucketAliasResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('RemoveBucketAlias')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const params = getQuery<Omit<RemoveBucketAliasRequest, 'bucketId'>>(event)
  if (!params?.globalAlias) {
    log.warn('Global alias is required')
    throw new HTTPError({ status: 400, statusText: 'Global alias is required' })
  }

  log.withMetadata({ bucketId: id, globalAlias: params.globalAlias }).debug('Removing bucket alias')
  const data = await gfetch<RemoveBucketAliasResponse>('/v2/RemoveBucketAlias', {
    method: 'POST',
    body: { ...params, bucketId: id }
  })

  return createResponse<RemoveBucketAliasResponse>(event, 'Remove Bucket Alias', { data })
})
