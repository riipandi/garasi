import { defineProtectedHandler } from '~/server/platform/guards'

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

export default defineProtectedHandler(async (event) => {
  const { gfetch, logger } = event.context

  logger.info('Getting cluster status')
  const data = await gfetch<GetClusterStatusResp>('/v2/GetClusterStatus')
  return { status: 'success', message: 'Get Cluster Status', data }
})
