import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type {
  CreateBucketRequest,
  CreateBucketResponse,
  CreateBucketLocalAlias
} from '~/shared/schemas/bucket.schema'
import type { ApiBucketKeyPerm } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<CreateBucketRequest>(event)
  if (!body?.globalAlias) {
    logger.warn('Global alias is required')
    throw new HTTPError({ status: 400, statusText: 'Global alias is required' })
  }

  // Validate localAlias if provided
  if (body?.localAlias) {
    const localAlias = body.localAlias as CreateBucketLocalAlias
    if (!localAlias?.accessKeyId) {
      logger.warn('Access Key ID is required for local alias')
      throw new HTTPError({ status: 400, statusText: 'Access Key ID is required for local alias' })
    }
    if (!localAlias?.alias) {
      logger.warn('Alias is required for local alias')
      throw new HTTPError({ status: 400, statusText: 'Alias is required for local alias' })
    }
  }

  const defaultLocalAliasPerm: ApiBucketKeyPerm = { owner: false, read: false, write: false }
  const localAlias = body.localAlias
    ? { ...body.localAlias, allow: body.localAlias.allow ?? defaultLocalAliasPerm }
    : null
  const requestBody: CreateBucketRequest = { globalAlias: body.globalAlias, localAlias }

  logger.withMetadata({ globalAlias: body.globalAlias }).debug('Creating bucket')
  const data = await gfetch<CreateBucketResponse>('/v2/CreateBucket', {
    method: 'POST',
    body: requestBody
  })

  return createResponse<CreateBucketResponse>(event, 'Create Bucket', { data })
})
