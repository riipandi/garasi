import { definePlugin } from 'nitro'
import { ofetch } from 'ofetch'
import { protectedEnv } from '~/shared/envars'

interface GarageClusterStatusResp {
  layoutVersion: number
  nodes: Array<{
    id: string
    garageVersion: string
    addr: string
    hostname: string
    isUp: boolean
    lastSeenSecsAgo: number | null
    role: object
    draining: false
    dataPartition: object
    metadataPartition: object
  }>
}

interface ClusterLayoutInfoResp {
  version: number
  roles: Array<{
    id: string
    zone: string
    tags: string[]
    capacity: number
    storedPartitions: number
    usableCapacity: number
  }>
  parameters: {
    zoneRedundancy: string
  }
  partitionSize: number
  stagedRoleChanges: Array<{
    remove: boolean
    id: string
  }>
  stagedParameters: object | null
}

export default definePlugin(async (_nitro) => {
  // Run Garage S3 initial setup (cluster layout)
  console.info('Preparing Garage S3 cluster layout...')

  // Create fetcher instance for Garage S3
  const gfetch = ofetch.create({
    baseURL: protectedEnv.GARAGE_ADMIN_API,
    headers: { Authorization: `Bearer ${protectedEnv.GARAGE_ADMIN_TOKEN}` }
  })

  // Step 1: Check cluster status
  const clusterStatus = await gfetch<GarageClusterStatusResp>('/v2/GetClusterStatus')
  console.log('clusterStatus', clusterStatus)

  // Step 2: Get current layout information
  const clusterLayoutInfo = await gfetch<ClusterLayoutInfoResp>('/v2/GetClusterLayout')
  console.log('clusterLayoutInfo', clusterLayoutInfo)

  // Step 3: Apply layout if needed

  // Step 4: Get or create master key
})
