import { getQuery, HTTPError } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { CreateMetadataSnapshotParams } from '~/shared/schemas/node.schema'
import type { CreateMetadataSnapshotResponse } from '~/shared/schemas/node.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const params = getQuery<CreateMetadataSnapshotParams>(event)
  if (!params?.node) {
    logger.warn('Node parameter is required')
    throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
  }

  logger.withMetadata({ node: params.node }).debug('Creating metadata snapshot')
  const data = await gfetch<CreateMetadataSnapshotResponse>('/v2/CreateMetadataSnapshot', {
    method: 'POST',
    params
  })

  return createResponse<CreateMetadataSnapshotResponse>(event, 'Create Metadata Snapshot', { data })
})
