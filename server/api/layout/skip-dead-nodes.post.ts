import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'
import { createResponse } from '~/server/platform/responder'
import type { SkipDeadNodesRequest } from '~/shared/schemas/layout.schema'
import type { SkipDeadNodesResponse } from '~/shared/schemas/layout.schema'

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context
  const log = logger.withPrefix('SkipDeadNodes')

  const body = await readBody<SkipDeadNodesRequest>(event)

  if (body?.version === undefined || body?.version === null) {
    log.warn('Version is required')
    throw new HTTPError({ status: 400, statusText: 'Version is required' })
  }

  if (body?.allowMissingData === undefined || body?.allowMissingData === null) {
    log.warn('allowMissingData is required')
    throw new HTTPError({ status: 400, statusText: 'allowMissingData is required' })
  }

  log
    .withMetadata({ version: body.version, allowMissingData: body.allowMissingData })
    .debug('Skipping dead nodes in cluster layout')
  const data = await gfetch<SkipDeadNodesResponse>('/v2/ClusterLayoutSkipDeadNodes', {
    method: 'POST',
    body
  })

  return createResponse<SkipDeadNodesResponse>(event, 'Cluster Layout Skip Dead Nodes', { data })
})
