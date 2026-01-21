import { defineHandler, HTTPError } from 'nitro/h3'

interface FreeSpaceResp {
  total: number
  available: number
}

interface NodeResp {
  id: string
  isUp: boolean
  draining: boolean
  addr: string | null
  hostname: string | null
  garageVersion: string | null
  lastSeenSecsAgo: number | null
  dataPartition: FreeSpaceResp | null
  metadataPartition: FreeSpaceResp | null
  role: object | null
}

interface GetClusterStatusResp {
  layoutVersion: number
  nodes: NodeResp[]
}

export default defineHandler(async (event) => {
  const { gfetch, logger } = event.context

  try {
    logger.info('Getting cluster status')
    const data = await gfetch<GetClusterStatusResp>('/v2/GetClusterStatus')

    return { status: 'success', message: 'Get Cluster Status', data }
  } catch (error) {
    event.res.status = error instanceof HTTPError ? error.status : 500
    const message = error instanceof Error ? error.message : 'Unknown error'
    const errors = error instanceof Error ? error.stack : null
    logger.withMetadata({ status: event.res.status }).withError(error).error(message)
    return { success: false, message, data: null, errors }
  }
})
