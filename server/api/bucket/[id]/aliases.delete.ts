import { getQuery, getRouterParam, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type {
  RemoveBucketGlobalAliasRequest,
  RemoveBucketLocalAliasRequest,
  RemoveBucketAliasResponse
} from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('RemoveBucketAlias')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const params = getQuery(event)

  // Handle global alias removal
  if (params?.globalAlias) {
    log
      .withMetadata({ bucketId: id, globalAlias: params.globalAlias })
      .debug('Removing global bucket alias')
    const data = await gfetch<RemoveBucketAliasResponse>('/v2/RemoveBucketGlobalAlias', {
      method: 'POST',
      body: { globalAlias: params.globalAlias, bucketId: id } as RemoveBucketGlobalAliasRequest
    })
    return createResponse<RemoveBucketAliasResponse>(event, 'Remove Global Bucket Alias', { data })
  }

  // Handle local alias removal
  if (params?.localAlias && params?.accessKeyId) {
    log
      .withMetadata({
        bucketId: id,
        localAlias: params.localAlias,
        accessKeyId: params.accessKeyId
      })
      .debug('Removing local bucket alias')
    const data = await gfetch<RemoveBucketAliasResponse>('/v2/RemoveBucketLocalAlias', {
      method: 'POST',
      body: {
        localAlias: params.localAlias,
        accessKeyId: params.accessKeyId,
        bucketId: id
      } as RemoveBucketLocalAliasRequest
    })
    return createResponse<RemoveBucketAliasResponse>(event, 'Remove Local Bucket Alias', { data })
  }

  // Neither global nor local alias parameters provided
  log.warn('Either globalAlias or both localAlias and accessKeyId are required')
  throw new HTTPError({
    status: 400,
    statusText: 'Either globalAlias or both localAlias and accessKeyId are required'
  })
})
