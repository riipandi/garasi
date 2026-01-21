import { defineHandler, HTTPError } from 'nitro/h3'

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
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
