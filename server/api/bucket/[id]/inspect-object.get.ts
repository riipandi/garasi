import { HTTPError, getQuery, getRouterParam } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { InspectObjectParams } from '~/shared/schemas/bucket.schema'
import type { InspectObjectResponse } from '~/shared/schemas/bucket.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('InspectObject')

  const id = getRouterParam(event, 'id')
  if (!id) {
    log.warn('Bucket ID is required')
    throw new HTTPError({ status: 400, statusText: 'Bucket ID is required' })
  }

  const { key } = getQuery<InspectObjectParams>(event)

  if (!key) {
    log.warn('Object key is required')
    throw new HTTPError({ status: 400, statusText: 'Object key is required' })
  }

  log.withMetadata({ bucketId: id, objectKey: key }).debug('Inspecting object')
  const data = await gfetch<InspectObjectResponse>('/v2/InspectObject', {
    params: { bucketId: id, key }
  })

  return createResponse<InspectObjectResponse>(event, 'Inspect Object', { data })
})
