import { defineHandler, HTTPError, getQuery } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface CreateMetadataSnapshotParams {
  node: string // Node ID to query, or `*` for all nodes, or `self` for the node responding to the request
}

interface CreateMetadataSnapshotResp {
  success: Record<string, null>
  error: Record<string, string>
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    const { node } = getQuery<CreateMetadataSnapshotParams>(event)

    if (!node) {
      logger.debug('Node parameter is required')
      throw new HTTPError({ status: 400, statusText: 'Node parameter is required' })
    }

    logger.withMetadata({ node }).info('Creating metadata snapshot')
    const data = await gfetch<CreateMetadataSnapshotResp>('/v2/CreateMetadataSnapshot', {
      method: 'POST',
      params: { node }
    })

    return { status: 'success', message: 'Create Metadata Snapshot', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
