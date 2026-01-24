import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { SkipDeadNodesRequest } from '~/shared/schemas/layout.schema'
import type { SkipDeadNodesResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<SkipDeadNodesRequest>(event)

  if (body?.version === undefined || body?.version === null) {
    logger.withPrefix('SkipDeadNodes').debug('Version is required')
    throw new HTTPError({ status: 400, statusText: 'Version is required' })
  }

  if (body?.allowMissingData === undefined || body?.allowMissingData === null) {
    logger.withPrefix('SkipDeadNodes').debug('allowMissingData is required')
    throw new HTTPError({ status: 400, statusText: 'allowMissingData is required' })
  }

  const data = await gfetch<SkipDeadNodesResponse>('/v2/ClusterLayoutSkipDeadNodes', {
    method: 'POST',
    body
  })
  logger.withMetadata(data).debug('Skipping dead nodes in cluster layout')

  return createResponse<SkipDeadNodesResponse>(event, 'Cluster Layout Skip Dead Nodes', { data })
})
