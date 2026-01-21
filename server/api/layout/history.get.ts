import { defineHandler } from 'nitro/h3'
import { createErrorResonse } from '~/server/platform/responder'

interface NodeUpdateTrackers {
  ack: number
  sync: number
  syncAck: number
}

interface ClusterLayoutVersion {
  version: number
  timestamp: number
  nodes: object[]
  roles: object[]
  parameters: object
  partitionSize: number
}

interface GetClusterLayoutHistoryResp {
  currentVersion: number
  minAck: number
  versions: ClusterLayoutVersion[]
  updateTrackers: Record<string, NodeUpdateTrackers> | null
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Getting cluster layout history')
    const data = await gfetch<GetClusterLayoutHistoryResp>('/v2/GetClusterLayoutHistory')

    return { status: 'success', message: 'Get Cluster Layout History', data }
  } catch (error) {
    return createErrorResonse(event, error)
  }
})
