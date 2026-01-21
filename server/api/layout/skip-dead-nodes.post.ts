import { HTTPError, readBody } from 'nitro/h3'
import { defineProtectedHandler } from '~/server/platform/guards'

interface ClusterLayoutSkipDeadNodesRequestBody {
  version: number
  allowMissingData: boolean
}

interface ClusterLayoutSkipDeadNodesResp {
  ackUpdated: string[]
  syncUpdated: string[]
}

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  const body = await readBody<ClusterLayoutSkipDeadNodesRequestBody>(event)

  if (body?.version === undefined || body?.version === null) {
    logger.debug('Version is required')
    throw new HTTPError({ status: 400, statusText: 'Version is required' })
  }

  if (body?.allowMissingData === undefined || body?.allowMissingData === null) {
    logger.debug('allowMissingData is required')
    throw new HTTPError({ status: 400, statusText: 'allowMissingData is required' })
  }

  logger
    .withMetadata({ version: body.version, allowMissingData: body.allowMissingData })
    .info('Cluster layout skip dead nodes')
  const data = await gfetch<ClusterLayoutSkipDeadNodesResp>('/v2/ClusterLayoutSkipDeadNodes', {
    method: 'POST',
    body
  })

  return { status: 'success', message: 'Cluster Layout Skip Dead Nodes', data }
})
