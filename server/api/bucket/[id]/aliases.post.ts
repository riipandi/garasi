import { getRouterParam, HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { AddBucketAliasResponse } from '~/shared/schemas/bucket.schema'

type AddAliasRequestBody = {
  globalAlias?: string
  localAlias?: string
  accessKeyId?: string
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const id = getRouterParam(event, 'id')
  if (!id) {
    logger.withPrefix('AddBucketAlias').debug('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const body = await readBody<AddAliasRequestBody>(event)
  if (!body?.globalAlias && !body?.localAlias) {
    logger.withPrefix('AddBucketAlias').debug('Either globalAlias or localAlias is required')
    throw new HTTPError({
      status: 400,
      statusText: 'Either globalAlias or localAlias is required'
    })
  }

  const data = await gfetch<AddBucketAliasResponse>('/v2/AddBucketAlias', {
    method: 'POST',
    body: { ...body, bucketId: id }
  })
  logger.withMetadata(data).debug('Adding bucket alias')

  return createResponse<AddBucketAliasResponse>(event, 'Add Bucket Alias', { data })
})
